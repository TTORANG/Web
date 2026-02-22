import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import type { ReadVideoDetailResponseDto, VideoCommentDto } from '@/api/dto/video.dto';
import { videosApi } from '@/api/endpoints/videos';
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ScriptSection from '@/components/feedback/ScriptSection';
import ReactionBubble from '@/components/feedback/video/ReactionBubble';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useProjectScripts } from '@/hooks/queries/useScript';
import { useSlides } from '@/hooks/queries/useSlides';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { SlideListItem } from '@/types';
import type { Comment as CommentType } from '@/types/comment';
import type { VideoTimestampFeedback } from '@/types/video';
import { countTreeComments } from '@/utils/comment';
import { clamp, parseSeekSecondsParam } from '@/utils/video';

export default function VideoDetailPage() {
  const { projectId, videoId } = useParams<{ projectId: string; videoId: string }>();
  const [searchParams] = useSearchParams();
  const seekParam = searchParams.get('t');
  const requestedSeekSeconds = parseSeekSecondsParam(seekParam);
  const currentUser = useAuthStore((state) => state.user);

  const isDesktop = useIsDesktop();
  const { initVideo, requestSeek: requestSeekAction } = useVideoFeedbackStore();

  const [videoData, setVideoData] = useState<ReadVideoDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [commentDraft, setCommentDraft] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [scrollToCommentId, setScrollToCommentId] = useState<string | undefined>();

  const { data: slidesData } = useSlides(projectId!, { liveSync: false });
  const { data: projectScripts } = useProjectScripts(projectId ?? '', {
    enabled: !!projectId,
    staleTime: 1000 * 60 * 10,
  });
  const [projectSlides, setProjectSlides] = useState<SlideListItem[]>([]);
  const [slideChangeTimes, setSlideChangeTimes] = useState<number[]>([]);
  const [slideIdOrder, setSlideIdOrder] = useState<string[]>([]);

  const desktopPlaceholderRef = useRef<HTMLDivElement>(null);
  const mobilePlaceholderRef = useRef<HTMLDivElement>(null);
  const initialSeekRequestedRef = useRef(false);
  const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
  });

  const transformComments = useCallback(
    (serverComments: VideoCommentDto[]): CommentType[] => {
      const dedupedComments = [
        ...new Map(serverComments.map((c) => [String(c.commentId), c])).values(),
      ];
      const rootTimestampById = new Map<string, number>();
      for (const comment of dedupedComments) {
        if (comment.parentId) continue;
        if (typeof comment.timestampMs === 'number') {
          rootTimestampById.set(String(comment.commentId), comment.timestampMs);
        }
      }

      const mapped = dedupedComments.map((comment) => {
        const commentId = String(comment.commentId);
        const parentId = comment.parentId ? String(comment.parentId) : undefined;
        const threadTimestampMs =
          typeof comment.timestampMs === 'number'
            ? comment.timestampMs
            : parentId
              ? rootTimestampById.get(parentId)
              : undefined;

        return {
          commentId,
          serverId: commentId,
          userId: String(comment.userId),
          userName: comment.writer || undefined,
          content: comment.content,
          createdAt: comment.createdAt,
          isMine: Boolean(comment.isMine) || String(comment.userId) === String(currentUser?.id),
          parentId,
          isReply: Boolean(parentId),
          ref:
            typeof threadTimestampMs === 'number'
              ? { kind: 'video' as const, seconds: threadTimestampMs / 1000 }
              : undefined,
          replies: [],
        };
      });

      const getThreadTimestamp = (comment: CommentType) => {
        if (comment.ref?.kind === 'video') return Math.round(comment.ref.seconds * 1000);
        if (comment.parentId)
          return rootTimestampById.get(comment.parentId) ?? Number.MAX_SAFE_INTEGER;
        return Number.MAX_SAFE_INTEGER;
      };

      return mapped.sort((a, b) => {
        const timestampDiff = getThreadTimestamp(a) - getThreadTimestamp(b);
        if (timestampDiff !== 0) return timestampDiff;

        if (a.isReply !== b.isReply) {
          return a.isReply ? 1 : -1;
        }

        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    },
    [currentUser?.id],
  );

  const buildFeedbacks = useCallback((flatComments: CommentType[]): VideoTimestampFeedback[] => {
    if (flatComments.length === 0) return [];

    const grouped = new Map<number, CommentType[]>();

    for (const comment of flatComments) {
      const timestampMs =
        comment.ref?.kind === 'video' ? Math.round(comment.ref.seconds * 1000) : 0;
      const commentsAtTimestamp = grouped.get(timestampMs) ?? [];
      commentsAtTimestamp.push(comment);
      grouped.set(timestampMs, commentsAtTimestamp);
    }

    return [...grouped.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([timestampMs, comments]) => ({
        timestampMs,
        comments,
        reactions: [],
      }));
  }, []);

  const { comments, addComment, addReply, deleteComment, updateComment } = useVideoComments({
    onMutationSuccess: () => loadData(false),
  });

  const loadData = useCallback(
    async (isInitial = false): Promise<boolean> => {
      if (!videoId) return false;

      try {
        const [detailResult, commentsResult] = await Promise.allSettled([
          videosApi.getVideoDetail(videoId),
          videosApi.getVideoCommentsAll(videoId),
        ]);

        if (detailResult.status !== 'fulfilled') return false;
        if (detailResult.value.data.resultType !== 'SUCCESS') return false;

        const data = detailResult.value.data.success!;
        const flatComments =
          commentsResult.status === 'fulfilled' &&
          commentsResult.value.data.resultType === 'SUCCESS'
            ? transformComments(commentsResult.value.data.success.comments ?? [])
            : [];
        const feedbacks = buildFeedbacks(flatComments);

        setVideoData(data);

        if (isInitial) {
          initVideo({
            videoId: data.video.videoId,
            title: data.video.title,
            videoUrl: data.video.hlsMasterUrl,
            duration: data.video.durationSeconds,
            feedbacks,
            comments: [],
            reactionEvents: [],
          });
        } else {
          useVideoFeedbackStore.setState((state) => ({
            ...state,
            video: state.video
              ? {
                  ...state.video,
                  feedbacks,
                }
              : null,
          }));
        }

        return true;
      } catch {
        return false;
      }
    },
    [videoId, initVideo, transformComments, buildFeedbacks],
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setLoadError(null);

      const loaded = await loadData(true);
      if (cancelled) return;

      if (!loaded) {
        setLoadError('영상 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        setIsLoading(false);
        return;
      }

      if (videoId) {
        try {
          const slidesRes = await videosApi.getVideoSlides(videoId);
          if (cancelled) return;

          if (slidesRes.data.resultType === 'SUCCESS') {
            const slides = slidesRes.data.success.slides;
            setSlideIdOrder(slides.map((s) => s.slideId));
            setSlideChangeTimes(slides.map((s) => s.timestampMs / 1000));
          }
        } catch {
          // 슬라이드 로딩 실패는 비디오 재생을 막지 않는다.
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    };
    void init();

    return () => {
      cancelled = true;
    };
  }, [videoId, loadData, reloadToken]);

  useEffect(() => {
    initialSeekRequestedRef.current = false;
  }, [videoId, seekParam]);

  useEffect(() => {
    if (isLoading) return;
    if (initialSeekRequestedRef.current) return;

    initialSeekRequestedRef.current = true;
    if (requestedSeekSeconds === null) return;

    const durationSeconds = videoData?.video.durationSeconds;
    const safeSeekSeconds =
      typeof durationSeconds === 'number' &&
      Number.isFinite(durationSeconds) &&
      durationSeconds >= 0
        ? clamp(requestedSeekSeconds, 0, durationSeconds)
        : requestedSeekSeconds;

    requestSeekAction(safeSeekSeconds);
  }, [isLoading, requestSeekAction, requestedSeekSeconds, videoData?.video.durationSeconds]);

  const handleGoToRef = useCallback(
    (ref: NonNullable<CommentType['ref']>) => {
      if (ref.kind === 'video') {
        requestSeekAction(ref.seconds);
      }
    },
    [requestSeekAction],
  );

  const handleAddReply = useCallback(
    (targetId: string, content: string) => {
      addReply(targetId, content);
    },
    [addReply],
  );

  const handleUpdateComment = useCallback(
    (commentId: string, content: string) => {
      updateComment(commentId, content);
    },
    [updateComment],
  );

  const handleAddMainComment = async () => {
    if (!commentDraft.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const successId = await addComment(commentDraft, currentTime);
      if (successId) {
        setCommentDraft('');
        await loadData(false);
        setScrollToCommentId(successId);
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    const updatePosition = () => {
      const primaryRef = isDesktop ? desktopPlaceholderRef : mobilePlaceholderRef;
      const fallbackRef = isDesktop ? mobilePlaceholderRef : desktopPlaceholderRef;

      let rect = primaryRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        rect = fallbackRef.current?.getBoundingClientRect();
      }
      if (!rect || rect.width === 0 || rect.height === 0) return;

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

    const timers = [0, 50, 100, 200].map((delay) => setTimeout(updatePosition, delay));

    const observer = new ResizeObserver(updatePosition);
    if (desktopPlaceholderRef.current) observer.observe(desktopPlaceholderRef.current);
    if (mobilePlaceholderRef.current) observer.observe(mobilePlaceholderRef.current);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isDesktop, isLoading]);

  useEffect(() => {
    if (!slidesData || slideIdOrder.length === 0) return;
    const slideMap = new Map(slidesData.map((slide) => [String(slide.slideId), slide]));
    const projectScriptMap = new Map(
      (projectScripts?.scripts ?? []).map((item) => [String(item.slideId), item.scriptText]),
    );
    const orderedSlides = slideIdOrder
      .map((id) => {
        const slide = slideMap.get(String(id));
        if (!slide) return undefined;

        return {
          ...slide,
          script: projectScriptMap.get(String(id)) ?? slide.script ?? '',
        };
      })
      .filter((slide): slide is SlideListItem => Boolean(slide));

    setProjectSlides(orderedSlides);
  }, [projectScripts, slideIdOrder, slidesData]);

  if (loadError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-body-m text-gray-700">{loadError}</p>
        <button
          type="button"
          onClick={() => setReloadToken((prev) => prev + 1)}
          className="rounded-full border border-gray-300 px-4 py-2 text-body-s text-gray-800 hover:bg-gray-50"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div
      role="tabpanel"
      id="tabpanel-videos"
      aria-labelledby="tab-videos"
      className="flex h-full w-full bg-gray-100 overflow-hidden"
    >
      {/* 데스크톱 뷰 */}
      <div className="hidden md:flex flex-1 px-35 pt-6">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div ref={desktopPlaceholderRef} className="w-full aspect-video" />
          </div>
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
            onSeek={requestSeekAction}
            isLoading={false}
          />
        </div>

        <aside className="ml-6 w-96 shrink-0 flex flex-col rounded-lg bg-white overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-body-m-bold text-gray-900">의견</h2>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
            <CommentList
              comments={comments}
              scrollToCommentId={scrollToCommentId}
              onAddReply={handleAddReply}
              onGoToRef={handleGoToRef}
              onDeleteComment={deleteComment}
              onUpdateComment={handleUpdateComment}
              isLoading={false}
              skipReplyFetch
            />
          </div>
          <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-6 pt-2">
            <CommentInput
              value={commentDraft}
              onChange={setCommentDraft}
              onSubmit={handleAddMainComment}
              onCancel={() => setCommentDraft('')}
              disabled={isSubmittingComment || isLoading}
              className="w-full"
            />
          </div>
        </aside>
      </div>

      {/* 모바일 뷰 */}
      <FeedbackMobileLayout
        mediaSlot={<div ref={mobilePlaceholderRef} className="w-full min-w-0 aspect-video" />}
        reactionSlot={<></>}
        scriptTabContent={
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
            onSeek={requestSeekAction}
            isLoading={false}
          />
        }
        commentTabContent={
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CommentList
                comments={comments}
                scrollToCommentId={scrollToCommentId}
                onAddReply={handleAddReply}
                onGoToRef={handleGoToRef}
                onDeleteComment={deleteComment}
                onUpdateComment={handleUpdateComment}
                isLoading={false}
                skipReplyFetch
              />
            </div>
            <div className="shrink-0 px-4 py-3">
              <CommentInput
                value={commentDraft}
                onChange={setCommentDraft}
                onSubmit={handleAddMainComment}
                onCancel={() => setCommentDraft('')}
                disabled={isSubmittingComment || isLoading}
                className="w-full"
              />
            </div>
          </>
        }
        commentCount={countTreeComments(comments)}
      />

      {/* 단일 SlideWebcamStage - CSS로 위치 조정 */}
      <div style={videoStyle} className="pointer-events-auto overflow-hidden relative">
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={videoData?.video.hlsMasterUrl || ''}
          isDataLoading={isLoading}
          dataErrorMessage={loadError}
          onTimeUpdate={setCurrentTime}
          disablePip={!isDesktop}
          showLayoutToggle={!isDesktop}
        />
        {/* 재생바 위 왼쪽 리액션 버블 */}
        <div className="absolute bottom-20 left-2 z-30">
          <ReactionBubble videoId={videoId} currentTimeMs={currentTime * 1000} />
        </div>
      </div>
    </div>
  );
}
