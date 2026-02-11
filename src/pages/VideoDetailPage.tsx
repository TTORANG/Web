import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { ReadVideoDetailResponseDto } from '@/api/dto/video.dto';
import { createReply, deleteComment, updateComment } from '@/api/endpoints/comments';
import { getScript } from '@/api/endpoints/scripts';
import { createVideoComment, videosApi } from '@/api/endpoints/videos';
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useSlides } from '@/hooks/queries/useSlides';
import { useVideoReactionHighlights } from '@/hooks/queries/useVideoReactionQueries';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { SlideListItem } from '@/types';
import type { Comment as CommentType } from '@/types/comment';

export default function VideoDetailPage() {
  const { projectId, videoId } = useParams<{ projectId: string; videoId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const requestSeekAction = useVideoFeedbackStore((s) => s.requestSeek);

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

  const duration = videoData?.video.durationSeconds || 0;

  // 1. 데이터 로드 로직
  useEffect(() => {
    const loadData = async () => {
      if (!videoId) return;
      setIsLoading(true);

      try {
        const response = await videosApi.getVideoDetail(videoId);
        if (response.data.resultType === 'SUCCESS') {
          const data = response.data.success!;
          setVideoData(data);

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
        console.error('[VideoDetailPage] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [videoId, currentUser?.id]);

  // 2. 슬라이드 및 스크립트 정렬
  useEffect(() => {
    if (!slidesData || slideIdOrder.length === 0) return;

    const loadScriptsAndOrder = async () => {
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

  const requestSeek = useCallback(
    (time: number) => {
      requestSeekAction(time);
    },
    [requestSeekAction],
  );

  const handleGoToTimeRef = useCallback(
    (ref: NonNullable<CommentType['ref']>) => {
      if (ref.kind === 'video') requestSeek(ref.seconds);
    },
    [requestSeek],
  );

  const handleAddComment = useCallback(async () => {
    if (!commentDraft.trim() || !videoId) return;
    try {
      const result = await createVideoComment(videoId, {
        content: commentDraft,
        timestampMs: Math.round(currentTime * 1000),
      });
      setComments((prev) => [
        ...prev,
        {
          commentId: result.serverId,
          content: result.content,
          ref: { kind: 'video', seconds: currentTime },
          createdAt: new Date().toISOString(),
          userId: currentUser?.id || 'me',
          isMine: true,
          replies: [],
        },
      ]);
      setCommentDraft('');
    } catch (err) {
      console.error('[VideoDetailPage] Add comment error:', err);
      alert('댓글 추가 실패');
    }
  }, [commentDraft, currentTime, videoId, currentUser]);

  const handleReplyComment = useCallback(
    async (parentId: string, content: string) => {
      if (!content.trim()) return;
      try {
        const result = await createReply(parentId, { content });
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.commentId === parentId) {
              return {
                ...comment,
                replies: [
                  ...(comment.replies || []),
                  {
                    commentId: result.replyId,
                    content: result.content,
                    createdAt: result.createdAt,
                    userId: currentUser?.id || 'me',
                    isMine: true,
                    isReply: true,
                    parentId: parentId,
                  },
                ],
              };
            }
            return comment;
          }),
        );
      } catch (err) {
        console.error('[VideoDetailPage] Reply error:', err);
        alert('답글 작성 중 오류가 발생했습니다.');
      }
    },
    [currentUser],
  );

  const handleUpdateComment = useCallback(async (commentId: string, content: string) => {
    if (!content.trim()) return;
    try {
      const result = await updateComment(commentId, { content });
      setComments((prev) =>
        prev.map((c) => {
          if (c.commentId === commentId) return { ...c, content: result.content };
          return {
            ...c,
            replies: c.replies?.map((r) =>
              r.commentId === commentId ? { ...r, content: result.content } : r,
            ),
          };
        }),
      );
    } catch (err) {
      console.error('[VideoDetailPage] Update comment error:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  }, []);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteComment({ commentId });
      setComments((prev) =>
        prev
          .filter((c) => c.commentId !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r.commentId !== commentId),
          })),
      );
    } catch (err) {
      console.error('[VideoDetailPage] Delete comment error:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }, []);

  const handleBack = () => navigate(`/${projectId}/videos`);

  const timestampPrefix = `[${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60)
    .toString()
    .padStart(2, '0')}] `;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-main border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-gray-100 overflow-hidden">
      {/* 뒤로가기 버튼 */}
      <div className="absolute left-4 top-4 z-30">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow hover:bg-gray-50 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">목록으로</span>
        </button>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col px-6 py-6 md:px-12">
        <div className="flex flex-1 flex-col gap-6 min-h-0 items-center pt-14">
          {/* 비디오 Placeholder */}
          <div
            ref={placeholderRef}
            className="aspect-video w-[80%] bg-black shadow-2xl rounded-lg"
          />

          {/* 스크립트 섹션 */}
          <div className="w-[85%] flex-1 min-h-0">
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

      {/* 댓글 사이드바 */}
      <aside className="hidden w-100 shrink-0 flex-col border border-gray-200 bg-white lg:flex my-2 mr-20 shadow-sm rounded-2xl">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="mt-4 p-4 border-b">
            <h3 className="text-gray-950 font-bold text-lg">의견 ({comments.length})</h3>
          </div>
          <CommentList
            comments={comments}
            onGoToRef={handleGoToTimeRef}
            onAddReply={handleReplyComment}
            onDeleteComment={handleDeleteComment}
            onUpdateComment={handleUpdateComment}
          />
        </div>

        <div className="shrink-0 border-t border-gray-100 p-4">
          <CommentInput
            value={commentDraft}
            onChange={setCommentDraft}
            onSubmit={handleAddComment}
            onCancel={() => setCommentDraft('')}
            className="w-full"
            initialValueOnFocus={timestampPrefix}
          />
        </div>
      </aside>

      {/* 실시간 렌더링되는 비디오 스테이지 */}
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
