import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { ReadVideoDetailResponseDto } from '@/api/dto/video.dto';
//import { createReply, deleteComment, updateComment } from '@/api/endpoints/comments';
import { getScript } from '@/api/endpoints/scripts';
import { videosApi } from '@/api/endpoints/videos';
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useSlides } from '@/hooks/queries/useSlides';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { SlideListItem } from '@/types';
import type { Comment as CommentType } from '@/types/comment';

export default function VideoDetailPage() {
  const { projectId, videoId } = useParams<{ projectId: string; videoId: string }>();
  const currentUser = useAuthStore((state) => state.user);

  // Zustand 스토어: initVideo를 사용해 비디오 정보를 등록합니다.
  const { initVideo, requestSeek: requestSeekAction } = useVideoFeedbackStore();

  const [videoData, setVideoData] = useState<ReadVideoDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentDraft, setCommentDraft] = useState('');

  const { data: slidesData } = useSlides(projectId!);

  const [projectSlides, setProjectSlides] = useState<SlideListItem[]>([]);
  const [slideChangeTimes, setSlideChangeTimes] = useState<number[]>([]);
  const [slideIdOrder, setSlideIdOrder] = useState<string[]>([]);

  const placeholderRef = useRef<HTMLDivElement>(null);
  const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
  });

  // 1. 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!videoId) return;
      setIsLoading(true);

      try {
        const response = await videosApi.getVideoDetail(videoId);
        if (response.data.resultType === 'SUCCESS') {
          const data = response.data.success!;
          setVideoData(data);

          // ✅ 핵심: 스토어 초기화 (이걸 해야 VideoPlaybackBar가 videoId를 잡습니다)
          initVideo({
            videoId: data.video.videoId,
            title: data.video.title,
            feedbacks: data.timeline?.feedbacks ?? [],
            videoUrl: '',
            duration: 0,
            comments: [],
            reactionEvents: [],
          });

          const transformed = (data.timeline?.comments ?? []).map((comment) => ({
            commentId: comment.commentId,
            content: comment.content,
            ref: { kind: 'video' as const, seconds: comment.timestampMs / 1000 },
            createdAt: comment.createdAt,
            userId: comment.user.userId,
            isMine: comment.user.userId === currentUser?.id,
            replies:
              comment.replies?.map((r) => ({
                commentId: r.replyId,
                content: r.content,
                createdAt: r.createdAt,
                userId: r.user.userId,
                isMine: r.user.userId === currentUser?.id,
                isReply: true as const,
                parentId: comment.commentId,
              })) ?? [],
          }));
          setComments(transformed as CommentType[]);
        }

        const slidesRes = await videosApi.getVideoSlides(videoId);
        if (slidesRes.data.resultType === 'SUCCESS') {
          const slides = slidesRes.data.success.slides;
          setSlideIdOrder(slides.map((s) => s.slideId));
          setSlideChangeTimes(slides.map((s) => s.timestampMs / 1000));
        }
      } catch (err) {
        console.error('Data Loading Error:', err);
      }
    };

    loadData();
  }, [videoId, currentUser?.id, initVideo]);

  // 2. 슬라이드/스크립트 결합 로직
  useEffect(() => {
    if (!slidesData || slideIdOrder.length === 0) {
      if (!isLoading && slideIdOrder.length === 0) setIsLoading(false);
      return;
    }

    const loadScriptsAndOrder = async () => {
      try {
        const ordered = await Promise.all(
          slideIdOrder.map(async (id) => {
            const slideBase = slidesData.find((s) => String(s.slideId) === String(id));
            if (!slideBase) return null;
            try {
              const scriptRes = await getScript(String(id));
              return {
                slideId: slideBase.slideId,
                imageUrl: slideBase.imageUrl,
                script: scriptRes.scriptText || '',
              };
            } catch (err) {
              return {
                slideId: slideBase.slideId,
                imageUrl: slideBase.imageUrl,
                script: slideBase.script || '',
              };
            }
          }),
        );
        setProjectSlides(ordered.filter((s): s is SlideListItem => s !== null));
      } finally {
        setIsLoading(false);
      }
    };
    loadScriptsAndOrder();
  }, [slidesData, slideIdOrder]);

  // 3. 비디오 위치 동적 계산
  useEffect(() => {
    const updatePosition = () => {
      if (isLoading) return;
      const rect = placeholderRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      setVideoStyle({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 20,
        opacity: 1,
        transition: 'all 0.15s ease-out',
      });
    };

    const timers = [0, 100, 300, 500].map((delay) => setTimeout(updatePosition, delay));
    const observer = new ResizeObserver(updatePosition);
    if (placeholderRef.current) observer.observe(placeholderRef.current);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isLoading, videoData, projectSlides]);

  const requestSeek = useCallback((time: number) => requestSeekAction(time), [requestSeekAction]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-main border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-gray-100 overflow-hidden">
      <div className="flex flex-1 flex-col h-full min-w-0">
        {/* 상단 비디오 영역 (고정) */}
        <div className="flex shrink-0 flex-col items-center pt-10 pb-6 px-6 md:px-12">
          <div
            ref={placeholderRef}
            className="aspect-video w-full max-w-[800px] bg-black rounded-lg"
          />
        </div>

        {/* 하단 스크립트 영역 (스크롤) */}
        <div className="flex-1 min-h-0 px-6 md:px-12 pb-6 flex flex-col items-center">
          <div className="w-full max-w-[800px] h-full flex flex-col min-h-0 overflow-y-auto">
            <ScriptSection
              slides={projectSlides}
              slideChangeTimes={slideChangeTimes}
              currentTime={currentTime}
              onSeek={requestSeek}
              isLoading={false}
            />
          </div>
        </div>
      </div>

      {/* 오른쪽 사이드바 */}
      <aside className="hidden w-100 shrink-0 flex-col border-l border-gray-200 bg-white lg:flex my-2 mr-6 shadow-sm overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="mt-4 p-4 border-b">
            <h3 className="text-gray font-bold text-lg">의견 ({comments.length})</h3>
          </div>
          <CommentList
            comments={comments}
            onGoToRef={(ref) => ref.kind === 'video' && requestSeek(ref.seconds)}
            onAddReply={async () => {}}
            onDeleteComment={async () => {}}
            onUpdateComment={async () => {}}
          />
        </div>
        <div className="p-4 border-t">
          <CommentInput
            value={commentDraft}
            onChange={setCommentDraft}
            onSubmit={() => {}}
            initialValueOnFocus={`[${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60)
              .toString()
              .padStart(2, '0')}] `}
            onCancel={function (): void {
              throw new Error('Function not implemented.');
            }}
          />
        </div>
      </aside>

      {/* 비디오 스테이지 */}
      <div style={videoStyle} className="pointer-events-auto rounded-lg overflow-hidden">
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={videoData?.video.hlsMasterUrl || ''}
          onTimeUpdate={setCurrentTime}
          disablePip={false}
          showLayoutToggle={false}
        />
      </div>
    </div>
  );
}
