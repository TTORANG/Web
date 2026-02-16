/**
 * @file useFeedbackVideo.ts
 * @description FeedbackVideoPage business logic
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { recordVideoEvent } from '@/api/endpoints/analytics';
import { getSharedComments } from '@/api/endpoints/shares';
import { videosApi } from '@/api/endpoints/videos';
import { createDefaultReactions } from '@/constants/reaction';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useVideoReactions } from '@/hooks/useVideoReactions';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import type { ReadSharedContentData, SharedPresentationComment } from '@/types/share';
import type { SlideDetail } from '@/types/slide';
import type { VideoTimestampFeedback } from '@/types/video';
import { formatVideoTimestamp } from '@/utils/format';
import { SHARED_PROJECT_ID, normalizeSharedSlides } from '@/utils/sharedContent';
import { getSlideIndexFromTime } from '@/utils/video';

// 타임라인 데이터 없을때, 슬라이드 1장당 10초로 균등분배
const FALLBACK_SLIDE_DURATION_SECONDS = 10;

export interface ShareExitSnapshot {
  lastSlideId?: number;
  lastVideoId?: number;
  lastVideoTimeMs?: number;
}

interface UseFeedbackVideoOptions {
  // SharePage가 최신 시청 위치 스냅샷을 받을 때 사용하는 콜백입니다.
  // 공유 플로우에서 /analytics/exit 실제 전송은 SharePage가 담당합니다.
  onShareExitSnapshotChange?: (snapshot: ShareExitSnapshot) => void;
}

function toPlayableVideoUrl(url?: string | null): string {
  const publicUrl = url ?? '';
  if (!publicUrl) return '';

  if (!import.meta.env.DEV) {
    return publicUrl;
  }

  try {
    // cors 문제 피하기 위해, 로컬 프록시 처리
    const parsed = new URL(publicUrl);
    if (parsed.hostname === 'cdn.ttorang.com') {
      return `/cdn-proxy${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // ignore invalid URL
  }

  return publicUrl;
}

// 슬라이드 목록과 타임라인 배열 만드는 함수
function mapSlidesByTimeline(
  sourceSlides: SlideDetail[],
  timeline: Array<{ slideId: string; timestampMs: number }>,
): { slides: SlideDetail[]; slideChangeTimes: number[] } {
  if (!timeline.length) {
    const slides = sourceSlides.map((slide, index) => ({
      ...slide,
      startTime:
        typeof slide.startTime === 'number' && Number.isFinite(slide.startTime)
          ? slide.startTime
          : index * FALLBACK_SLIDE_DURATION_SECONDS,
    }));
    return { slides, slideChangeTimes: slides.map((slide) => slide.startTime ?? 0) };
  }

  const sortedTimeline = timeline
    .slice()
    .sort((a, b) => a.timestampMs - b.timestampMs)
    .filter((item) => item.slideId);
  const slideMap = new Map(sourceSlides.map((slide) => [String(slide.slideId), slide]));
  const now = new Date().toISOString();
  const fallbackProjectId = sourceSlides[0]?.projectId ?? SHARED_PROJECT_ID;

  const slides = sortedTimeline.map((item, index) => {
    const matchedSlide = slideMap.get(String(item.slideId)) ?? sourceSlides[index];

    if (matchedSlide) {
      return {
        ...matchedSlide,
        startTime: Math.max(0, item.timestampMs / 1000),
      };
    }

    return {
      slideId: String(item.slideId),
      projectId: fallbackProjectId,
      title: `슬라이드 ${index + 1}`,
      slideNum: index + 1,
      imageUrl: '',
      createdAt: now,
      updatedAt: now,
      script: '',
      startTime: Math.max(0, item.timestampMs / 1000),
    } satisfies SlideDetail;
  });

  return {
    slides,
    slideChangeTimes: slides.map((slide) => slide.startTime ?? 0),
  };
}

function normalizeTimestampMs(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

function mapSharedCommentsToFeedbacks(
  rawComments: SharedPresentationComment[],
): VideoTimestampFeedback[] {
  if (!rawComments.length) return [];

  const groupedComments = new Map<number, Comment[]>();

  rawComments.forEach((sharedComment, index) => {
    const timestampMs = normalizeTimestampMs(sharedComment.timestampMs);
    const fallbackId = `shared-comment-${timestampMs}-${index}`;
    const commentId = sharedComment.commentId || fallbackId;
    const parentId = sharedComment.parentId ?? undefined;
    const userId = sharedComment.userId || sharedComment.writer?.trim() || 'unknown';
    // writer가 비어있거나 없으면 undefined (Comment 컴포넌트에서 fallback 처리)
    const userName = sharedComment.writer?.trim() || undefined;

    const mappedComment: Comment = {
      commentId,
      serverId: commentId,
      parentId,
      isReply: Boolean(parentId),
      replies: parentId ? undefined : [],
      userId,
      userName,
      userProfileImage: sharedComment.profileImageUrl ?? undefined,
      content: sharedComment.content,
      createdAt: sharedComment.createdAt,
      isMine: sharedComment.isMine,
      ref: { kind: 'video', seconds: timestampMs / 1000 },
    };

    const existing = groupedComments.get(timestampMs) ?? [];
    existing.push(mappedComment);
    groupedComments.set(timestampMs, existing);
  });

  return [...groupedComments.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([timestampMs, comments]) => ({
      timestampMs,
      comments,
      reactions: createDefaultReactions(),
    }));
}

// 메인훅
export function useFeedbackVideo(
  sharedContent: ReadSharedContentData,
  options: UseFeedbackVideoOptions = {},
) {
  const { onShareExitSnapshotChange } = options;

  // ─── 라우트 파라미터 ───────────────────────────────────
  const { shareToken = '' } = useParams<{ shareToken?: string }>();

  // ─── Store 셀렉터 ─────────────────────────────────────
  const video = useVideoFeedbackStore((s) => s.video);
  const initVideo = useVideoFeedbackStore((s) => s.initVideo);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);
  const updateFeedbacks = useVideoFeedbackStore((s) => s.updateFeedbacks);

  // ─── 로컬 상태 ────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [projectSlides, setProjectSlides] = useState<SlideDetail[]>([]);
  const [slideChangeTimes, setSlideChangeTimes] = useState<number[]>([]);

  // ─── 파생 값 ──────────────────────────────────────────
  const timestampPrefix = useMemo(() => `${formatVideoTimestamp(currentTime)} `, [currentTime]);
  const videoIdNum = useMemo(() => {
    const parsed = Number(video?.videoId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [video?.videoId]);

  // ─── 공유 콘텐츠 로딩 ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadFromSharedContent = async (content: ReadSharedContentData) => {
      const sharedSlides = normalizeSharedSlides(content.presentationContent.slides);
      const sharedComments = content.presentationContent.comments;
      const sharedFeedbacks = mapSharedCommentsToFeedbacks(sharedComments);
      const fallbackTimelineSlides = content.presentationContent.slides
        .filter(
          (slide) =>
            typeof slide.timestampMs === 'number' &&
            Number.isFinite(slide.timestampMs) &&
            slide.timestampMs >= 0,
        )
        .map((slide) => ({
          slideId: String(slide.slideId),
          timestampMs: normalizeTimestampMs(slide.timestampMs),
        }));

      const videoId = content.presentationContent.video?.videoId ?? '';
      const normalizedVideoId = String(videoId);
      let videoUrl = toPlayableVideoUrl(content.presentationContent.video?.videoUrl);
      let videoTitle = content.presentationContent.title || '공유 영상';
      let duration = 0;
      let timelineSlides: Array<{ slideId: string; timestampMs: number }> = fallbackTimelineSlides;

      if (normalizedVideoId) {
        const [detailResult, timelineResult] = await Promise.allSettled([
          videosApi.getVideoDetail(normalizedVideoId),
          videosApi.getVideoSlides(normalizedVideoId),
        ]);
        if (cancelled) return;

        if (
          detailResult.status === 'fulfilled' &&
          detailResult.value.data.resultType === 'SUCCESS'
        ) {
          const serverVideo = detailResult.value.data.success.video;
          videoTitle = serverVideo?.title || videoTitle;
          duration = serverVideo?.durationSeconds || duration;
          videoUrl = videoUrl || toPlayableVideoUrl(serverVideo?.hlsMasterUrl);
        }

        if (
          timelineResult.status === 'fulfilled' &&
          timelineResult.value.data.resultType === 'SUCCESS'
        ) {
          timelineSlides = timelineResult.value.data.success.slides.map((slide) => ({
            slideId: String(slide.slideId),
            timestampMs: slide.timestampMs,
          }));
        }
      }

      const mapped = mapSlidesByTimeline(sharedSlides, timelineSlides);

      initVideo({
        videoId: normalizedVideoId,
        videoUrl: videoUrl || '',
        title: videoTitle,
        duration,
        comments: sharedFeedbacks.flatMap((feedback) => feedback.comments),
        reactionEvents: [],
        feedbacks: sharedFeedbacks,
      });

      setProjectSlides(mapped.slides);
      setSlideChangeTimes(mapped.slideChangeTimes);
    };

    const load = async () => {
      try {
        await loadFromSharedContent(sharedContent);
      } catch {
        if (cancelled) return;
      } finally {
        if (!cancelled) {
          setTimeout(() => setIsLoading(false), 0);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [initVideo, sharedContent, shareToken]);

  // ─── 리액션 ───────────────────────────────────────────
  const { reactions, addReaction } = useVideoReactions();

  // ─── 댓글 ─────────────────────────────────────────────
  const [commentDraft, setCommentDraft] = useState('');
  const [scrollToCommentId, setScrollToCommentId] = useState<string | undefined>(undefined);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = useState<number | null>(null);

  const reloadComments = useCallback(async () => {
    if (!shareToken) return null;
    try {
      const { user } = useAuthStore.getState();
      const data = await getSharedComments(shareToken, user?.sessionId);
      const sharedFeedbacks = mapSharedCommentsToFeedbacks(data.comments);
      updateFeedbacks(sharedFeedbacks);
      return data.comments;
    } catch {
      return null;
    }
  }, [shareToken, updateFeedbacks]);

  const { comments, addComment, addReply, deleteComment, updateComment } = useVideoComments({
    onMutationSuccess: () => void reloadComments(),
  });

  const handleInputFocus = useCallback(() => {
    if (capturedTimestamp === null) {
      setCapturedTimestamp(currentTime);
    }
  }, [capturedTimestamp, currentTime]);

  const handleAddComment = useCallback(async () => {
    if (!commentDraft.trim()) return;
    setIsSubmittingComment(true);

    try {
      const timestampToUse = capturedTimestamp ?? currentTime;
      const newCommentServerId = await addComment(commentDraft, timestampToUse);
      setCommentDraft('');
      setCapturedTimestamp(null);

      const latestComments = await reloadComments();

      if (newCommentServerId && latestComments) {
        const newComment = latestComments.find(
          (c: SharedPresentationComment) => c.commentId === newCommentServerId,
        );
        if (newComment) {
          setScrollToCommentId(newComment.commentId);
          setTimeout(() => setScrollToCommentId(undefined), 500);
        }
      }
    } finally {
      setIsSubmittingComment(false);
    }
  }, [addComment, commentDraft, currentTime, capturedTimestamp, reloadComments]);

  const handleCancelComment = useCallback(() => {
    setCommentDraft('');
    setCapturedTimestamp(null);
  }, []);

  const handleGoToTimeRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind === 'video') requestSeek(ref.seconds);
    },
    [requestSeek],
  );

  // ─── 비디오 재생 이벤트 기록 ──────────────────────────
  const handleVideoPlaybackEvent = useCallback(
    (eventType: 'play' | 'pause' | 'seek', timeSeconds: number) => {
      if (videoIdNum == null) return;
      const timestampMs = Math.max(0, Math.round(timeSeconds * 1000));

      void recordVideoEvent({
        videoId: videoIdNum,
        eventType,
        timestampMs,
      }).catch(() => undefined);
    },
    [videoIdNum],
  );

  // ─── 시청 위치 스냅샷 (SharePage exit 보고용) ─────────
  useEffect(() => {
    if (!onShareExitSnapshotChange) return;
    if (!shareToken || !video || isLoading) return;

    const safeCurrentTime = Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0;
    const snapshot: ShareExitSnapshot = {
      lastVideoTimeMs: Math.round(safeCurrentTime * 1000),
    };

    if (videoIdNum != null) {
      snapshot.lastVideoId = videoIdNum;
    }

    if (projectSlides.length > 0) {
      const changeTimes =
        slideChangeTimes.length > 0
          ? slideChangeTimes
          : projectSlides.map((_, index) => index * FALLBACK_SLIDE_DURATION_SECONDS);
      const lastSlideIndex = getSlideIndexFromTime(
        safeCurrentTime,
        changeTimes,
        projectSlides.length - 1,
      );
      const lastSlideId = Number(projectSlides[lastSlideIndex]?.slideId);
      if (Number.isFinite(lastSlideId)) {
        snapshot.lastSlideId = lastSlideId;
      }
    }

    onShareExitSnapshotChange(snapshot);
  }, [
    onShareExitSnapshotChange,
    shareToken,
    video,
    isLoading,
    currentTime,
    videoIdNum,
    projectSlides,
    slideChangeTimes,
  ]);

  // ─── Return ───────────────────────────────────────────
  return {
    isLoading,
    currentTime,
    projectSlides,
    slideChangeTimes,
    webcamVideoUrl: video?.videoUrl || '',

    // 댓글
    comments,
    commentDraft,
    timestampPrefix,
    scrollToCommentId,
    isSubmittingComment,
    setCommentDraft,
    handleInputFocus,
    handleAddComment,
    handleCancelComment,
    handleGoToTimeRef,
    addReply,
    deleteComment,
    updateComment,

    // 리액션
    reactions,
    addReaction,

    // 비디오 재생
    updateCurrentTime,
    requestSeek,
    handleVideoPlaybackEvent,
  };
}

export type FeedbackVideoContext = ReturnType<typeof useFeedbackVideo>;
