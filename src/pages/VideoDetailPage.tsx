import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { ReadVideoDetailResponseDto } from '@/api/dto/video.dto';
import { createVideoComment, videosApi } from '@/api/endpoints/videos';
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useSlides } from '@/hooks/queries/useSlides';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { SlideListItem } from '@/types';
import type { Comment as CommentType } from '@/types/comment';

export default function VideoDetailPage() {
  const { projectId, videoId } = useParams<{ projectId: string; videoId: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const currentUser = useAuthStore((state) => state.user);

  // Zustand 스토어에서 시점 이동 액션 가져오기
  const requestSeekAction = useVideoFeedbackStore((s) => s.requestSeek);

  const [videoData, setVideoData] = useState<ReadVideoDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(0);

  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentDraft, setCommentDraft] = useState('');

  const { data: slidesData } = useSlides(projectId!);
  const [projectSlides, setProjectSlides] = useState<SlideListItem[]>([]);
  const [slideChangeTimes, setSlideChangeTimes] = useState<number[]>([]);
  const [slideIdOrder, setSlideIdOrder] = useState<string[]>([]);

  const desktopPlaceholderRef = useRef<HTMLDivElement>(null);
  const mobilePlaceholderRef = useRef<HTMLDivElement>(null);
  const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
  });

  // 1. 영상 상세 데이터 로드
  useEffect(() => {
    const loadVideoDetail = async () => {
      if (!videoId) return;
      setIsLoading(true);

      try {
        const numericVideoId = parseInt(videoId, 10);
        const response = await videosApi.getVideoDetail(numericVideoId.toString());

        if (response.data.resultType === 'SUCCESS') {
          const data = response.data.success!;
          setVideoData(data);

          // 댓글 변환 로직
          const transformedComments: CommentType[] = (data.timeline?.comments ?? []).map(
            (comment) => ({
              commentId: comment.commentId,
              content: comment.content,
              ref: { kind: 'video', seconds: comment.timestampMs / 1000 },
              createdAt: comment.createdAt,
              userId: comment.user.userId,
              isMine: comment.user.userId === currentUser?.id,
              replies:
                comment.replies?.map((reply) => ({
                  commentId: reply.replyId,
                  content: reply.content,
                  createdAt: reply.createdAt,
                  userId: reply.user.userId,
                  isMine: reply.user.userId === currentUser?.id,
                  isReply: true,
                  parentId: comment.commentId,
                })) ?? [],
            }),
          );
          setComments(transformedComments);
        }

        // 2. 비디오 슬라이드 타임라인 로드
        const slidesResponse = await videosApi.getVideoSlides(numericVideoId.toString());
        if (slidesResponse.data.resultType === 'SUCCESS') {
          const slides = slidesResponse.data.success.slides;
          setSlideIdOrder(slides.map((s) => s.slideId));
          setSlideChangeTimes(slides.map((s) => s.timestampMs / 1000));
        }
      } catch (err) {
        setError('영상 로드 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadVideoDetail();
  }, [videoId, currentUser?.id]);

  // 3. 슬라이드 순서 정렬
  useEffect(() => {
    if (!slidesData || slideIdOrder.length === 0) return;
    const orderedSlides = slideIdOrder
      .map((id) => {
        const slide = slidesData.find((s) => s.slideId === id);
        return slide
          ? { slideId: slide.slideId, imageUrl: slide.imageUrl, script: slide.script || '' }
          : null;
      })
      .filter((s): s is SlideListItem => s !== null);
    setProjectSlides(orderedSlides);
  }, [slidesData, slideIdOrder]);

  // 4. 비디오 위치 추적 레이아웃
  useEffect(() => {
    const updatePosition = () => {
      const ref = isDesktop ? desktopPlaceholderRef : mobilePlaceholderRef;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      setVideoStyle({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 20,
        opacity: 1,
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isDesktop]);

  // 5. 비디오 제어 핸들러
  const updateCurrentTime = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // [수정] 스토어의 requestSeek 액션 호출
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

  // 댓글 추가/수정/삭제 로직 (기존 유지)
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
      alert('댓글 추가 실패');
    }
  }, [commentDraft, currentTime, videoId, currentUser]);

  const handleReplyComment = useCallback(async (_id: string, _content: string) => {}, []);

  const handleDeleteComment = useCallback(async (_id: string) => {}, []);

  const handleUpdateComment = useCallback(async (_id: string, _content: string) => {}, []);

  const handleBack = () => navigate(`/${projectId}/videos`);
  const timestampPrefix = `[${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60)
    .toString()
    .padStart(2, '0')}] `;

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-main border-t-transparent" />
      </div>
    );

  return (
    <div className="flex h-full w-full bg-gray-100">
      {/* 모바일 헤더 */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3 md:hidden">
        <button onClick={handleBack}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="truncate text-lg font-bold">{videoData?.video.title}</h1>
      </div>

      {/* 데스크탑 레이아웃 */}
      <div className="hidden flex-1 px-8 py-6 md:flex">
        <div className="absolute left-4 top-4 z-30">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow hover:bg-gray-50"
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

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 pt-14">
          <div ref={desktopPlaceholderRef} className="aspect-video w-full" />
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
            onSeek={requestSeek}
            isLoading={false}
          />
        </div>

        <aside className="flex w-96 shrink-0 flex-col border-l border-gray-200 bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <CommentList
              comments={comments}
              onAddReply={handleReplyComment}
              onGoToRef={handleGoToTimeRef}
              onDeleteComment={handleDeleteComment}
              onUpdateComment={handleUpdateComment}
            />
          </div>
          <div className="flex shrink-0 flex-col gap-4 border-t border-gray-200 px-4 pb-6 pt-4">
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
      </div>

      {/* 모바일 레이아웃 */}
      <div className="flex-1 pt-14 md:hidden">
        <FeedbackMobileLayout
          mediaSlot={<div ref={mobilePlaceholderRef} className="aspect-video w-full" />}
          reactionSlot={null}
          scriptTabContent={
            <ScriptSection
              slides={projectSlides}
              slideChangeTimes={slideChangeTimes}
              currentTime={currentTime}
              onSeek={requestSeek}
            />
          }
          commentTabContent={
            <>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <CommentList
                  comments={comments}
                  onAddReply={handleReplyComment}
                  onGoToRef={handleGoToTimeRef}
                  onDeleteComment={handleDeleteComment}
                  onUpdateComment={handleUpdateComment}
                />
              </div>
              <div className="shrink-0 border-t px-4 py-3">
                <CommentInput
                  value={commentDraft}
                  onChange={setCommentDraft}
                  onSubmit={handleAddComment}
                  onCancel={() => setCommentDraft('')}
                  initialValueOnFocus={timestampPrefix}
                />
              </div>
            </>
          }
          commentCount={comments.length}
        />
      </div>

      {/* 고정된 영상 컴포넌트 */}
      <div style={videoStyle}>
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={videoData?.video.hlsMasterUrl || ''}
          onTimeUpdate={updateCurrentTime}
          disablePip={!isDesktop}
          showLayoutToggle={!isDesktop}
        />
      </div>
    </div>
  );
}
