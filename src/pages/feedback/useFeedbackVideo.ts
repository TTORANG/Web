/**
 * @file useFeedbackVideo.ts
 * @description FeedbackVideoPage business logic
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { recordVideoEvent } from '@/api/endpoints/analytics';
import { getSharedContent } from '@/api/endpoints/shares';
import { videosApi } from '@/api/endpoints/videos';
import { createDefaultReactions } from '@/constants/reaction';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useVideoReactions } from '@/hooks/useVideoReactions';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import type {
  ReadSharedContentData,
  SharedProjectComment,
  SharedProjectSlide,
} from '@/types/share';
import type { SlideDetail } from '@/types/slide';
import type { VideoTimestampFeedback } from '@/types/video';
import { userFromAccessToken } from '@/utils/auth';
import { formatVideoTimestamp } from '@/utils/format';
import { getSlideIndexFromTime } from '@/utils/video';

const DEFAULT_VIDEO_ID = '34';
const FALLBACK_SLIDE_DURATION_SECONDS = 10;
const FALLBACK_VIDEO_DURATION_SECONDS = 9;
const SHARED_PROJECT_ID = 'shared';

export interface ShareExitSnapshot {
  lastSlideId?: number;
  lastVideoId?: number;
  lastVideoTimeMs: number;
}

interface UseFeedbackVideoOptions {
  // SharePage가 최신 시청 위치 스냅샷을 받을 때 사용하는 콜백입니다.
  // 공유 플로우에서 /analytics/exit 실제 전송은 SharePage가 담당합니다.
  onShareExitSnapshotChange?: (snapshot: ShareExitSnapshot) => void;
}

function toPublicUrl(url?: string | null): string {
  if (!url) return '';
  return url.startsWith('gs://') ? `https://storage.googleapis.com/${url.slice(5)}` : url;
}

function toPlayableVideoUrl(url?: string | null): string {
  const publicUrl = toPublicUrl(url);
  if (!publicUrl) return '';

  if (!import.meta.env.DEV) {
    return publicUrl;
  }

  try {
    const parsed = new URL(publicUrl);
    if (parsed.hostname === 'cdn.ttorang.com') {
      return `/cdn-proxy${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // ignore invalid URL
  }

  return publicUrl;
}

function toNumber(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeSharedSlides(rawSlides: SharedProjectSlide[]): SlideDetail[] {
  const now = new Date().toISOString();

  return rawSlides
    .map((slide, index) => {
      const slideNum = toNumber(slide.slideNum, index + 1);
      return {
        slideId: slide.slideId,
        projectId: SHARED_PROJECT_ID,
        title: `슬라이드 ${slideNum}`,
        slideNum,
        imageUrl: toPublicUrl(slide.imageUrl),
        createdAt: now,
        updatedAt: now,
        script: slide.scriptText,
      };
    })
    .sort((a, b) => a.slideNum - b.slideNum);
}

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

function toNumericId(value: string | number | null | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  }
  return null;
}

function mapSharedCommentsToFeedbacks(
  rawComments: SharedProjectComment[],
  currentUserId?: string,
  currentUserName?: string,
): VideoTimestampFeedback[] {
  if (!rawComments.length) return [];

  const groupedComments = new Map<number, Comment[]>();

  rawComments.forEach((sharedComment, index) => {
    const timestampMs = normalizeTimestampMs(sharedComment.timestampMs);
    const fallbackId = `shared-comment-${timestampMs}-${index}`;
    const commentId = sharedComment.commentId || fallbackId;
    const parentId = sharedComment.parentId ?? undefined;
    const userId = sharedComment.writer.trim() || 'unknown';

    const mappedComment: Comment = {
      commentId,
      serverId: commentId,
      parentId,
      isReply: Boolean(parentId),
      replies: parentId ? undefined : [],
      userId,
      content: sharedComment.content,
      createdAt: sharedComment.createdAt,
      isMine:
        (Boolean(currentUserId) && userId === currentUserId) ||
        (Boolean(currentUserName) && userId === currentUserName),
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

export function useFeedbackVideo(
  sharedContent?: ReadSharedContentData,
  options: UseFeedbackVideoOptions = {},
) {
  const { onShareExitSnapshotChange } = options;
  const { shareToken: routeShareToken = '' } = useParams<{
    shareToken?: string;
  }>();
  const [searchParams] = useSearchParams();
  const queryShareToken = searchParams.get('shareToken') ?? '';
  const shareToken = routeShareToken || queryShareToken;

  const [isLoading, setIsLoading] = useState(true);
  const [projectSlides, setProjectSlides] = useState<SlideDetail[]>([]);
  const [slideChangeTimes, setSlideChangeTimes] = useState<number[]>([]);

  const video = useVideoFeedbackStore((s) => s.video);
  const initVideo = useVideoFeedbackStore((s) => s.initVideo);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);

  const { comments, addComment, addReply, deleteComment, updateComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();
  const [commentDraft, setCommentDraft] = useState('');

  const timestampPrefix = useMemo(() => `${formatVideoTimestamp(currentTime)} `, [currentTime]);
  // 비디오 이벤트 기록 API는 number videoId를 사용합니다.
  const videoIdNum = useMemo(() => {
    const parsed = Number(video?.videoId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [video?.videoId]);

  const handleAddComment = useCallback(() => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, currentTime);
    setCommentDraft('');
  }, [addComment, commentDraft, currentTime]);

  const handleGoToTimeRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind === 'video') requestSeek(ref.seconds);
    },
    [requestSeek],
  );
  // 비디오 재생 이벤트(play/pause/seek)를 기록합니다.
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
  // SharePage가 중앙에서 exit를 전송할 수 있도록 최신 시청 위치를 부모로 보고합니다.
  // (공유 플로우에서 이 훅은 /analytics/exit를 직접 전송하지 않습니다.)
  useEffect(() => {
    if (!onShareExitSnapshotChange) return;
    // 초기 마운트/로딩 구간은 제외해서 0초 스냅샷 보고를 방지합니다.
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
      const lastSlideId = toNumericId(projectSlides[lastSlideIndex]?.slideId);
      if (lastSlideId != null) {
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
  useEffect(() => {
    let cancelled = false;

    const loadFromSharedContent = async (content: ReadSharedContentData) => {
      let { user } = useAuthStore.getState();
      const sessionId = user?.sessionId;

      if (!sessionId) {
        const accessToken = content.sessionInfo.tokens.accessToken;
        const refreshToken = content.sessionInfo.tokens.refreshToken;
        const anonymousSessionId = content.sessionInfo.sessionId;
        if (accessToken && refreshToken) {
          const store = useAuthStore.getState();
          const derivedUser = userFromAccessToken(accessToken, anonymousSessionId);
          store.setAuth({
            user: derivedUser,
            accessToken,
            refreshToken,
            anonymousSessionId: anonymousSessionId ?? null,
          });
          ({ user } = useAuthStore.getState());
        }
      }

      const sharedSlides = normalizeSharedSlides(content.projectContent.slides);
      const sharedComments = content.projectContent.comments;
      const sharedFeedbacks = mapSharedCommentsToFeedbacks(sharedComments, user?.id, user?.name);
      const fallbackTimelineSlides = content.projectContent.slides
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

      const videoId = content.projectContent.video?.videoId ?? '';
      const normalizedVideoId = String(videoId || DEFAULT_VIDEO_ID);
      let videoUrl = toPlayableVideoUrl(content.projectContent.video?.videoUrl);
      let videoTitle = content.projectContent.title || '공유 영상';
      let duration = FALLBACK_VIDEO_DURATION_SECONDS;
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

    const loadFromShareToken = async () => {
      const content = await getSharedContent(shareToken);
      if (cancelled) return;
      await loadFromSharedContent(content);
    };

    const load = async () => {
      try {
        if (sharedContent) {
          await loadFromSharedContent(sharedContent);
        } else if (shareToken) {
          await loadFromShareToken();
        }
      } catch {
        if (cancelled) return;

        initVideo({
          videoId: DEFAULT_VIDEO_ID,
          videoUrl: '',
          title: '공유 영상',
          duration: FALLBACK_VIDEO_DURATION_SECONDS,
          comments: [],
          reactionEvents: [],
          feedbacks: [],
        });
        setProjectSlides([]);
        setSlideChangeTimes([]);
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

  return {
    isLoading,
    currentTime,
    projectSlides,
    slideChangeTimes,
    comments,
    reactions,
    commentDraft,
    timestampPrefix,

    updateCurrentTime,
    requestSeek,
    setCommentDraft,
    handleAddComment,
    handleGoToTimeRef,
    handleVideoPlaybackEvent,
    addReply,
    deleteComment,
    updateComment,
    toggleReaction,

    webcamVideoUrl: video?.videoUrl || '',
  };
}

export type FeedbackVideoContext = ReturnType<typeof useFeedbackVideo>;
