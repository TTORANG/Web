// src/hooks/useInsightPageModel.ts
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import type {
  ReadRecentCommentListResponseDto,
  ReadVideoExitAnalyticsResponseDto,
  ReadVideoRetentionResponseDto,
  RecentCommentDto,
  SlideAnalyticsDto,
  SlideRetentionDto,
  VideoExitAnalyticsDto,
  VideoRetentionDto,
} from '@/api/dto/analytics.dto';
import type {
  ReadVideoCommentsAllResponseDto,
  ReadVideoSlidesResponseDto,
  VideoCommentDto,
} from '@/api/dto/video.dto';
import { videosApi } from '@/api/endpoints/videos';
import { queryKeys } from '@/api/queryClient';
import type { ChartDataPoint, InsightModel, InsightTopSlide } from '@/components/insight/types';
import {
  DEMO_ANALYTICS_SUMMARY,
  DEMO_RECENT_COMMENTS,
  DEMO_SLIDE_ANALYTICS,
  DEMO_SLIDE_RETENTION,
  DEMO_VIDEO_EXIT_ANALYTICS,
  DEMO_VIDEO_LIST_ITEMS,
  DEMO_VIDEO_RETENTION,
  DEMO_VIDEO_SLIDES_TIMELINE,
  getDemoSlideReactionSummary,
  isDemoProject,
} from '@/constants/demoProject';
import { REACTION_TYPES } from '@/constants/reaction';
import {
  usePresentationAnalyticsSummary,
  useSlideAnalytics,
  useSlideRetention,
  useVideoAnalytics,
  useVideoRetention,
} from '@/hooks/queries/useAnalytics';
import { useSlideReactionSummaries } from '@/hooks/queries/useReaction.ts';
import { useSlides } from '@/hooks/queries/useSlides';
import { useVideoReactionBuckets } from '@/hooks/queries/useVideoReactionQueries';
import { useVideoSlides } from '@/hooks/queries/useVideoSlides';
import { usePresentationVideos } from '@/hooks/usePresentationVideos';
import type { DropOffSlide, DropOffTime, SummaryStat } from '@/types/insight';
import type { ReactionType } from '@/types/script';
import type { SlideListItem } from '@/types/slide';
import { formatTimestamp, formatVideoTimestamp } from '@/utils/format';
import { getSlideTitle } from '@/utils/slideTitle';
import { getSlideIndexFromTime } from '@/utils/video';

const summaryStatLabels = ['총 조회수', '완독률', '받은 피드백', '평균 시청 시간'] as const;

const emptySummaryStats: SummaryStat[] = summaryStatLabels.map((label) => ({
  label,
  value: '-',
  sub: '',
}));

const normalizeRate = (rate: number) => (rate <= 1 ? rate * 100 : rate);
const AUTO_DATA_SOURCE_KEY = 'auto';
const SLIDE_DATA_SOURCE_KEY = 'slide';
const VIDEO_DATA_SOURCE_PREFIX = 'video:';

const toVideoDataSourceKey = (videoId: string) => `${VIDEO_DATA_SOURCE_PREFIX}${videoId}`;

const parseVideoDataSourceKey = (sourceKey: string): string | null => {
  if (!sourceKey.startsWith(VIDEO_DATA_SOURCE_PREFIX)) return null;
  return sourceKey.slice(VIDEO_DATA_SOURCE_PREFIX.length) || null;
};

const hasNumericTimestamp = (
  comment: VideoCommentDto,
): comment is VideoCommentDto & { timestampMs: number } =>
  typeof comment.timestampMs === 'number' && Number.isFinite(comment.timestampMs);

const toSafeDateMs = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const createEmptyReactionCounts = (): Record<ReactionType, number> => ({
  fire: 0,
  sleepy: 0,
  good: 0,
  bad: 0,
  confused: 0,
});

const sumReactionCounts = (counts: Record<ReactionType, number>): number =>
  REACTION_TYPES.reduce((sum, type) => sum + (counts[type] ?? 0), 0);

const normalizeRateToFraction = (rate: number): number => {
  if (!Number.isFinite(rate)) return 0;
  if (rate <= 1) return Math.max(0, Math.min(rate, 1));
  return Math.max(0, Math.min(rate / 100, 1));
};

const estimateAverageWatchSeconds = (retention?: ReadVideoRetentionResponseDto): number | null => {
  if (!retention?.videoRetention?.length || retention.durationSeconds <= 0) {
    return null;
  }

  const sortedRetention = retention.videoRetention
    .slice()
    .sort((a, b) => a.timestampMs - b.timestampMs);
  const duration = retention.durationSeconds;
  let area = 0;

  for (let index = 0; index < sortedRetention.length; index += 1) {
    const current = sortedRetention[index];
    const next = sortedRetention[index + 1];
    const startSeconds = Math.max(0, current.timestampMs / 1000);
    const endSeconds = Math.min(duration, next ? next.timestampMs / 1000 : duration);
    if (endSeconds <= startSeconds) continue;

    const currentRate = normalizeRateToFraction(current.retentionRate);
    const nextRate = next ? normalizeRateToFraction(next.retentionRate) : currentRate;
    area += ((currentRate + nextRate) / 2) * (endSeconds - startSeconds);
  }

  return Math.max(0, Math.min(duration, area));
};

export function useInsightPageModel(): InsightModel {
  const { projectId } = useParams<{ projectId: string }>();
  const projectIdStr = projectId ?? '';
  const isDemoProjectId = isDemoProject(projectIdStr);
  const projectIdNum = projectIdStr ? Number(projectIdStr) : 0;

  const slidesQuery = useSlides(projectIdStr, { liveSync: false });
  const slideAnalyticsQuery = useSlideAnalytics(projectIdNum, { enabled: !isDemoProjectId });
  const summaryAnalyticsQuery = usePresentationAnalyticsSummary(projectIdNum, {
    enabled: !isDemoProjectId,
  });

  const { data: slides } = slidesQuery;
  const slideAnalytics = isDemoProjectId ? DEMO_SLIDE_ANALYTICS : slideAnalyticsQuery.data;
  const summaryAnalytics = isDemoProjectId ? DEMO_ANALYTICS_SUMMARY : summaryAnalyticsQuery.data;

  const videoIds = useMemo(() => {
    const sourceIds = isDemoProjectId
      ? DEMO_VIDEO_LIST_ITEMS.map((video) => String(video.videoId))
      : (summaryAnalytics?.videoIds ?? []);

    const seen = new Set<string>();
    const deduplicated: string[] = [];

    sourceIds.forEach((id) => {
      const normalizedId = String(id).trim();
      if (!normalizedId || seen.has(normalizedId)) return;
      seen.add(normalizedId);
      deduplicated.push(normalizedId);
    });

    return deduplicated;
  }, [isDemoProjectId, summaryAnalytics?.videoIds]);

  const latestVideoId = videoIds[videoIds.length - 1] ?? null;
  const hasVideo = videoIds.length > 0;
  const [selectedDataSourceKey, setSelectedDataSourceKey] = useState(AUTO_DATA_SOURCE_KEY);

  const presentationVideosQuery = usePresentationVideos({
    projectId: projectIdStr,
    sort: 'recent',
    enabled: Boolean(projectIdStr) && (isDemoProjectId || hasVideo),
  });

  const videoMetaById = useMemo(() => {
    const mapped = new Map<
      string,
      {
        title: string;
        createdAt: string;
        viewCount: number;
        feedbackCount: number;
        thumbnailUrl?: string;
      }
    >();

    presentationVideosQuery.data?.videos.forEach((video) => {
      const id = String(video.videoId);
      if (!id || mapped.has(id)) return;
      mapped.set(id, {
        title: video.title,
        createdAt: video.createdAt,
        viewCount: video.viewCount,
        feedbackCount: video.feedbackCount,
        thumbnailUrl: video.thumbnailUrl || undefined,
      });
    });
    return mapped;
  }, [presentationVideosQuery.data?.videos]);

  const dataSourceOptions = useMemo<InsightModel['dataSourceOptions']>(() => {
    const options: InsightModel['dataSourceOptions'] = [
      {
        key: SLIDE_DATA_SOURCE_KEY,
        label: '슬라이드 자료만',
        kind: 'slide',
        videoId: null,
      },
    ];

    if (!hasVideo) {
      return options;
    }

    const reversedVideoIds = [...videoIds].reverse();
    const totalVideos = videoIds.length;

    reversedVideoIds.forEach((videoId, indexFromLatest) => {
      const videoMeta = videoMetaById.get(videoId);
      const fallbackLabel = `영상 ${totalVideos - indexFromLatest}`;
      const resolvedTitle = videoMeta?.title?.trim() || fallbackLabel;
      const subLabel = videoMeta?.createdAt ? formatTimestamp(videoMeta.createdAt) : undefined;

      options.push({
        key: toVideoDataSourceKey(videoId),
        label: resolvedTitle,
        subLabel,
        thumbnailUrl: videoMeta?.thumbnailUrl,
        kind: 'video',
        videoId,
      });
    });

    return options;
  }, [hasVideo, videoIds, videoMetaById]);

  const resolvedDataSourceKey = useMemo(() => {
    if (selectedDataSourceKey === AUTO_DATA_SOURCE_KEY) {
      return hasVideo && latestVideoId
        ? toVideoDataSourceKey(latestVideoId)
        : SLIDE_DATA_SOURCE_KEY;
    }

    const selectedVideoId = parseVideoDataSourceKey(selectedDataSourceKey);
    if (selectedVideoId && !videoIds.includes(selectedVideoId)) {
      return hasVideo && latestVideoId
        ? toVideoDataSourceKey(latestVideoId)
        : SLIDE_DATA_SOURCE_KEY;
    }

    return selectedDataSourceKey;
  }, [hasVideo, latestVideoId, selectedDataSourceKey, videoIds]);

  const selectedVideoId = parseVideoDataSourceKey(resolvedDataSourceKey);
  const selectedDataSource =
    dataSourceOptions.find((option) => option.key === resolvedDataSourceKey) ??
    dataSourceOptions[0];
  const selectedDataSourceLabel = selectedDataSource?.label ?? '슬라이드 자료만';
  const selectedDataSourceSubLabel = selectedDataSource?.subLabel;
  const isVideoSource = Boolean(selectedVideoId);

  const selectedVideoIdNum = selectedVideoId ? Number(selectedVideoId) : 0;
  const enableSelectedVideoQueries = !isDemoProjectId && isVideoSource && selectedVideoIdNum > 0;

  const onSelectDataSource = useCallback(
    (sourceKey: string) => {
      if (!dataSourceOptions.some((option) => option.key === sourceKey)) return;
      setSelectedDataSourceKey(sourceKey);
    },
    [dataSourceOptions],
  );

  const videoAnalyticsQuery = useVideoAnalytics(selectedVideoIdNum, {
    enabled: enableSelectedVideoQueries,
  });
  const videoSlidesQuery = useVideoSlides(selectedVideoIdNum, {
    enabled: enableSelectedVideoQueries,
  });

  const videoExitAnalytics: ReadVideoExitAnalyticsResponseDto | undefined = isVideoSource
    ? isDemoProjectId
      ? DEMO_VIDEO_EXIT_ANALYTICS
      : videoAnalyticsQuery.data
    : undefined;

  const videoSlidesTimeline: ReadVideoSlidesResponseDto | undefined = isVideoSource
    ? isDemoProjectId
      ? DEMO_VIDEO_SLIDES_TIMELINE
      : videoSlidesQuery.data
    : undefined;

  const selectedVideoIdForReactionQuery =
    !isDemoProjectId && isVideoSource ? (selectedVideoId ?? undefined) : undefined;
  const videoReactionBucketsQuery = useVideoReactionBuckets(selectedVideoIdForReactionQuery, 5000);

  // ---- Summary stats ----
  const projectSummaryStats = useMemo<SummaryStat[]>(() => {
    if (!summaryAnalytics) return emptySummaryStats;

    const completionRate =
      summaryAnalytics.completionRate <= 1
        ? summaryAnalytics.completionRate * 100
        : summaryAnalytics.completionRate;

    return [
      { label: summaryStatLabels[0], value: String(summaryAnalytics.totalViews), sub: '' },
      { label: summaryStatLabels[1], value: `${Math.round(completionRate)}%`, sub: '' },
      { label: summaryStatLabels[2], value: String(summaryAnalytics.totalFeedbackCount), sub: '' },
      {
        label: summaryStatLabels[3],
        value: formatVideoTimestamp(summaryAnalytics.avgDurationSeconds),
        sub: '',
      },
    ];
  }, [summaryAnalytics]);

  // ---- Slides map / thumbs ----
  const slideList = useMemo(() => (Array.isArray(slides) ? slides : []), [slides]);

  const slideDataMaps = useMemo(() => {
    const slideIndexById = new Map<string, number>();
    const slideById = new Map<string, SlideListItem>();

    slideList.forEach((slide, index) => {
      slideIndexById.set(slide.slideId, index);
      slideById.set(slide.slideId, slide);
    });

    return { slideIndexById, slideById };
  }, [slideList]);

  const getThumb = (slideIndex: number) => slideList[slideIndex]?.imageUrl;
  const getSlideIdByIndex = (slideIndex: number) => slideList[slideIndex]?.slideId ?? null;

  const slideSeekSecondsByIndex = useMemo(() => {
    const timelineItems = videoSlidesTimeline?.slides ?? [];
    if (!timelineItems.length) {
      return new Map<number, number>();
    }

    const { slideIndexById } = slideDataMaps;
    const mapped = new Map<number, number>();
    const maxSlideIndex = Math.max(0, slideList.length - 1);

    timelineItems
      .slice()
      .filter((item) => item.slideId)
      .sort((a, b) => a.timestampMs - b.timestampMs)
      .forEach((item, timelineIndex) => {
        // slideId 매칭이 안되는 경우에도 타임라인 순서를 기준으로 안전하게 보정
        const fallbackIndex = Math.min(timelineIndex, maxSlideIndex);
        const slideIndex = slideIndexById.get(item.slideId) ?? fallbackIndex;
        if (mapped.has(slideIndex)) {
          return;
        }

        mapped.set(slideIndex, Math.max(0, item.timestampMs / 1000));
      });

    return mapped;
  }, [slideDataMaps, slideList.length, videoSlidesTimeline]);

  const getSeekSecondsForSlide = (slideIndex: number): number | null => {
    const mapped = slideSeekSecondsByIndex.get(slideIndex);
    if (mapped !== undefined) {
      return mapped;
    }

    if (slideSeekSecondsByIndex.size > 0) {
      const entries = [...slideSeekSecondsByIndex.entries()].sort((a, b) => a[0] - b[0]);
      const previous = entries
        .slice()
        .reverse()
        .find(([mappedIndex]) => mappedIndex < slideIndex);

      if (previous) {
        return previous[1];
      }

      return entries[0]?.[1] ?? 0;
    }

    if (slideIndex === 0) {
      return 0;
    }

    return null;
  };

  // ---- Drop-off ----
  const dropOffTimeline = useMemo(() => {
    const timelineItems = videoSlidesTimeline?.slides ?? [];
    if (!timelineItems.length) {
      return {
        changeTimes: [] as number[],
        slideIndexes: [] as number[],
      };
    }

    const { slideIndexById } = slideDataMaps;
    const maxSlideIndex = Math.max(0, slideList.length - 1);

    const sortedTimeline = timelineItems
      .slice()
      .filter((item) => item.slideId)
      .sort((a, b) => a.timestampMs - b.timestampMs);

    const changeTimes = sortedTimeline.map((item) => Math.max(0, item.timestampMs / 1000));
    const slideIndexes = sortedTimeline.map((item, index) => {
      const mappedIndex = slideIndexById.get(item.slideId);
      if (mappedIndex !== undefined) {
        return mappedIndex;
      }

      return Math.min(index, maxSlideIndex);
    });

    return { changeTimes, slideIndexes };
  }, [slideDataMaps, slideList.length, videoSlidesTimeline]);

  const selectedVideoCommentsQuery = useQuery({
    queryKey: [...queryKeys.videos.all, 'commentsAll', selectedVideoIdNum] as const,
    queryFn: async (): Promise<ReadVideoCommentsAllResponseDto> => {
      const response = await videosApi.getVideoCommentsAll(String(selectedVideoIdNum));

      if (response.data.resultType === 'FAILURE') {
        throw new Error(response.data.error?.reason || '영상 댓글 데이터를 불러오지 못했습니다.');
      }

      return response.data.success;
    },
    enabled: enableSelectedVideoQueries,
  });

  const selectedVideoRecentComments = useMemo<ReadRecentCommentListResponseDto | undefined>(() => {
    const sourceComments = selectedVideoCommentsQuery.data?.comments;
    if (!sourceComments) return undefined;

    const { changeTimes, slideIndexes } = dropOffTimeline;
    const hasTimeline = changeTimes.length > 0;
    const maxSlideIndex = Math.max(0, slideList.length - 1);

    const comments = sourceComments
      .filter(hasNumericTimestamp)
      .slice()
      .sort((a, b) => toSafeDateMs(b.createdAt) - toSafeDateMs(a.createdAt))
      .map<RecentCommentDto>((comment) => {
        const seconds = Math.max(0, comment.timestampMs / 1000);
        const timelineIndex = hasTimeline
          ? getSlideIndexFromTime(seconds, changeTimes, changeTimes.length - 1)
          : 0;
        const fallbackIndex = Math.min(Math.max(timelineIndex, 0), maxSlideIndex);
        const mappedSlideIndex = hasTimeline
          ? (slideIndexes[timelineIndex] ?? fallbackIndex)
          : fallbackIndex;
        const slideIndex = Math.min(Math.max(mappedSlideIndex, 0), maxSlideIndex);
        const slide = slideList[slideIndex];
        const slideNum = slide?.slideNum ?? slideIndex + 1;
        const writerName = comment.writer?.trim() || '익명';

        return {
          commentId: comment.commentId,
          content: comment.content,
          timestampMs: comment.timestampMs,
          createdAt: comment.createdAt,
          user: {
            userId: comment.userId,
            nickName: writerName,
            name: writerName,
            profileImageUrl: null,
          },
          slide: {
            slideId: slide?.slideId ?? `mapped-slide-${slideNum}`,
            slideNum,
            title: slide?.title ?? null,
            imageUrl: slide?.imageUrl ?? '',
          },
        };
      });

    return { comments };
  }, [dropOffTimeline, selectedVideoCommentsQuery.data?.comments, slideList]);

  const recentCommentsData = useMemo<ReadRecentCommentListResponseDto | undefined>(() => {
    if (!isVideoSource) return undefined;
    if (isDemoProjectId) return DEMO_RECENT_COMMENTS;
    return selectedVideoRecentComments;
  }, [isDemoProjectId, isVideoSource, selectedVideoRecentComments]);

  const videoReactionSummary = useMemo(() => {
    const totalCounts = createEmptyReactionCounts();
    const countsBySlideIndex = new Map<number, Record<ReactionType, number>>();
    let totalCount = 0;

    if (!isVideoSource) {
      return { totalCounts, countsBySlideIndex, totalCount };
    }

    const { changeTimes, slideIndexes } = dropOffTimeline;
    const hasTimeline = changeTimes.length > 0;
    const reactionBuckets = isDemoProjectId ? [] : (videoReactionBucketsQuery.data?.buckets ?? []);

    reactionBuckets.forEach((bucket) => {
      const seconds = Math.max(0, bucket.timestampMs / 1000);
      const timelineIndex = hasTimeline
        ? getSlideIndexFromTime(seconds, changeTimes, changeTimes.length - 1)
        : 0;
      const slideIndex = hasTimeline ? (slideIndexes[timelineIndex] ?? 0) : 0;
      const currentCounts = countsBySlideIndex.get(slideIndex) ?? createEmptyReactionCounts();

      let bucketTotal = 0;
      REACTION_TYPES.forEach((type) => {
        const reactionCount = bucket.reactions[type] ?? 0;
        if (reactionCount <= 0) return;

        currentCounts[type] += reactionCount;
        totalCounts[type] += reactionCount;
        bucketTotal += reactionCount;
      });

      if (bucketTotal > 0) {
        countsBySlideIndex.set(slideIndex, currentCounts);
        totalCount += bucketTotal;
      }
    });

    if (isDemoProjectId) {
      slideList.forEach((slide, slideIndex) => {
        const demoCounts = getDemoSlideReactionSummary(slide.slideId);
        const slideTotal = sumReactionCounts(demoCounts);
        if (slideTotal <= 0) return;

        countsBySlideIndex.set(slideIndex, { ...demoCounts });
        REACTION_TYPES.forEach((type) => {
          totalCounts[type] += demoCounts[type] ?? 0;
        });
        totalCount += slideTotal;
      });
    }

    return { totalCounts, countsBySlideIndex, totalCount };
  }, [dropOffTimeline, isDemoProjectId, isVideoSource, slideList, videoReactionBucketsQuery.data]);

  const feedbackDistributionTitle = isVideoSource
    ? '영상 이모지 피드백 분포'
    : '슬라이드 이모지 피드백 분포';
  const feedbackDistributionCounts = isVideoSource ? videoReactionSummary.totalCounts : undefined;
  const feedbackDistributionTotalCount = isVideoSource
    ? videoReactionSummary.totalCount
    : undefined;

  const selectedVideoMeta = selectedVideoId ? videoMetaById.get(selectedVideoId) : undefined;

  // ---- Top slides ----
  const topSlides = useMemo<InsightTopSlide[]>(() => {
    if (isVideoSource) {
      return [...videoReactionSummary.countsBySlideIndex.entries()]
        .map(([slideIndex, reactions]) => ({
          slideIndex,
          reactions,
          totalCount: sumReactionCounts(reactions),
        }))
        .filter((item) => item.totalCount > 0)
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, 3)
        .map((item) => {
          const slide = slideList[item.slideIndex];
          const slideNum = slide?.slideNum ?? item.slideIndex + 1;
          const title = getSlideTitle(slide?.title, slideNum);
          const fallbackSlideId = `mapped-slide-${slideNum}`;

          return {
            slideId: slide?.slideId ?? fallbackSlideId,
            slide,
            slideIndex: item.slideIndex,
            title,
            commentCount: 0,
            feedbackCount: item.totalCount,
          };
        });
    }

    const analyticsSlides: SlideAnalyticsDto[] = slideAnalytics?.slides ?? [];
    if (!analyticsSlides.length) return [];

    const { slideIndexById, slideById } = slideDataMaps;

    return analyticsSlides
      .slice()
      .sort((a, b) => b.feedbackCount - a.feedbackCount)
      .slice(0, 3)
      .map((item) => {
        const slide = slideById.get(item.slideId);
        const slideIndex = slideIndexById.get(item.slideId) ?? Math.max(0, item.slideNum - 1);
        const title = getSlideTitle(slide?.title ?? item.title, slideIndex + 1);

        return {
          slideId: item.slideId,
          slide,
          slideIndex,
          title,
          commentCount: item.commentCount,
          feedbackCount: item.feedbackCount,
        };
      });
  }, [isVideoSource, slideAnalytics, slideDataMaps, slideList, videoReactionSummary]);

  const topSlideIds = useMemo(
    () => (isVideoSource ? [] : topSlides.map((item) => item.slideId)),
    [isVideoSource, topSlides],
  );
  const topSlideReactionSummariesQuery = useSlideReactionSummaries(topSlideIds);
  const { data: topSlideReactionSummariesBySlide } = topSlideReactionSummariesQuery;
  const topSlideReactionSummaries = useMemo(() => {
    if (isVideoSource) {
      return topSlides.map(({ slideIndex }) => {
        const mappedCounts = videoReactionSummary.countsBySlideIndex.get(slideIndex);
        return mappedCounts ? { ...mappedCounts } : createEmptyReactionCounts();
      });
    }

    return topSlideReactionSummariesBySlide;
  }, [isVideoSource, topSlides, topSlideReactionSummariesBySlide, videoReactionSummary]);

  const dropOffSlides: DropOffSlide[] = useMemo(() => {
    if (isVideoSource) {
      const exitItems: VideoExitAnalyticsDto[] = videoExitAnalytics?.exits ?? [];
      if (!exitItems.length) return [];

      const { changeTimes, slideIndexes } = dropOffTimeline;
      const hasTimeline = changeTimes.length > 0;
      const exitCountBySlideIndex = new Map<number, number>();

      exitItems.forEach((item) => {
        const seconds = Math.max(0, item.timestampMs / 1000);
        const timelineIndex = hasTimeline
          ? getSlideIndexFromTime(seconds, changeTimes, changeTimes.length - 1)
          : 0;
        const slideIndex = hasTimeline ? (slideIndexes[timelineIndex] ?? 0) : 0;
        const accumulated = exitCountBySlideIndex.get(slideIndex) ?? 0;
        exitCountBySlideIndex.set(slideIndex, accumulated + item.exitCount);
      });

      const totalExitCount = [...exitCountBySlideIndex.values()].reduce(
        (sum, count) => sum + count,
        0,
      );

      return [...exitCountBySlideIndex.entries()]
        .map(([slideIndex, count]) => {
          const slideNum = slideList[slideIndex]?.slideNum ?? slideIndex + 1;

          return {
            label: getSlideTitle(undefined, slideNum),
            desc: `${count}명 이탈`,
            percent: totalExitCount > 0 ? Math.round((count / totalExitCount) * 100) : 0,
            slideIndex,
            count,
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    }

    const items: SlideAnalyticsDto[] = slideAnalytics?.slides ?? [];
    return items
      .slice()
      .sort((a, b) => b.exitCount - a.exitCount)
      .slice(0, 3)
      .map((item) => ({
        label: getSlideTitle(undefined, item.slideNum),
        desc: `${item.exitCount}명 이탈`,
        percent: Math.min(
          100,
          Math.round(
            item.exitRate <= 1
              ? item.exitRate * 100
              : item.exitRate > 100
                ? item.exitRate / 100
                : item.exitRate,
          ),
        ),
        slideIndex: Math.max(0, item.slideNum - 1),
        count: item.exitCount,
      }));
  }, [dropOffTimeline, isVideoSource, slideAnalytics, slideList, videoExitAnalytics]);

  const dropOffTimes: DropOffTime[] = useMemo(() => {
    const items: VideoExitAnalyticsDto[] = videoExitAnalytics?.exits ?? [];
    const { changeTimes, slideIndexes } = dropOffTimeline;
    const hasTimeline = changeTimes.length > 0;

    return items
      .slice()
      .sort((a, b) => b.exitCount - a.exitCount)
      .slice(0, 3)
      .map((item) => {
        const seconds = item.timestampMs / 1000;
        const timelineIndex = hasTimeline
          ? getSlideIndexFromTime(seconds, changeTimes, changeTimes.length - 1)
          : 0;
        const slideIndex = hasTimeline ? (slideIndexes[timelineIndex] ?? 0) : 0;
        const slideNum = slideList[slideIndex]?.slideNum ?? slideIndex + 1;

        return {
          time: formatVideoTimestamp(seconds),
          desc: slideList.length ? getSlideTitle(undefined, slideNum) : '슬라이드',
          count: item.exitCount,
          slideIndex,
          seconds,
        };
      });
  }, [dropOffTimeline, slideList, videoExitAnalytics]);

  // ---- Retention(잔존율) ----
  const videoRetentionQuery = useVideoRetention(selectedVideoIdNum, {
    enabled: enableSelectedVideoQueries,
  });
  const slideRetentionQuery = useSlideRetention(projectIdNum, { enabled: !isDemoProjectId });
  const videoRetentionRes: ReadVideoRetentionResponseDto | undefined = isVideoSource
    ? isDemoProjectId
      ? DEMO_VIDEO_RETENTION
      : videoRetentionQuery.data
    : undefined;
  const slideRetentionRes = isDemoProjectId ? DEMO_SLIDE_RETENTION : slideRetentionQuery.data;

  const videoChartData = useMemo<ChartDataPoint[]>(() => {
    if (!videoRetentionRes?.videoRetention) return [];
    const { changeTimes, slideIndexes } = dropOffTimeline;
    const hasTimeline = changeTimes.length > 0;

    return videoRetentionRes.videoRetention.map((item: VideoRetentionDto) => {
      const seconds = Math.max(0, item.timestampMs / 1000);
      const timelineIndex = hasTimeline
        ? getSlideIndexFromTime(seconds, changeTimes, changeTimes.length - 1)
        : 0;
      const slideIndex = hasTimeline ? (slideIndexes[timelineIndex] ?? 0) : 0;

      return {
        label: formatVideoTimestamp(seconds), // x축: 00:00
        value: Math.round(normalizeRate(item.retentionRate)), // y축: 0~100%
        tooltipTitle: formatVideoTimestamp(seconds),
        sessionCount: item.sessionCount,
        originalTime: item.timestampMs,
        seekSeconds: seconds,
        thumbUrl: slideList[slideIndex]?.imageUrl,
      };
    });
  }, [dropOffTimeline, slideList, videoRetentionRes]);

  const slideChartData = useMemo<ChartDataPoint[]>(() => {
    if (!slideRetentionRes?.slideRetention) return [];
    return slideRetentionRes.slideRetention.map((item: SlideRetentionDto) => {
      const slideIndex = Math.max(0, item.slideNum - 1);

      return {
        label: `S${item.slideNum}`, // x축: S1, S2
        value: Math.round(normalizeRate(item.retentionRate)),
        tooltipTitle: getSlideTitle(item.title, item.slideNum), // 툴팁: 제목
        sessionCount: item.sessionCount,
        slideIndex,
        thumbUrl: slideList[slideIndex]?.imageUrl,
      };
    });
  }, [slideList, slideRetentionRes]);

  const retentionTitle = isVideoSource ? '영상 시청 잔존률' : '슬라이드별 청중 잔존률';
  const retentionData = isVideoSource ? videoChartData : slideChartData;

  const completionRateForSelectedVideo = useMemo(() => {
    const retentionPoints = videoRetentionRes?.videoRetention;
    if (!retentionPoints?.length) return null;

    const lastPoint = retentionPoints[retentionPoints.length - 1];
    return Math.round(normalizeRate(lastPoint.retentionRate));
  }, [videoRetentionRes]);

  const avgWatchSecondsForSelectedVideo = useMemo(
    () => estimateAverageWatchSeconds(videoRetentionRes),
    [videoRetentionRes],
  );

  const summaryStats = useMemo<SummaryStat[]>(() => {
    if (!isVideoSource) {
      return projectSummaryStats.filter((stat) => stat.label !== summaryStatLabels[3]);
    }

    const viewsValue =
      selectedVideoMeta?.viewCount ??
      videoRetentionRes?.totalSessions ??
      summaryAnalytics?.totalViews ??
      null;

    const feedbackValue =
      selectedVideoMeta?.feedbackCount ??
      feedbackDistributionTotalCount ??
      summaryAnalytics?.totalFeedbackCount ??
      null;

    const completionValue =
      completionRateForSelectedVideo ??
      (summaryAnalytics ? Math.round(normalizeRate(summaryAnalytics.completionRate)) : null);

    const avgDurationValue =
      avgWatchSecondsForSelectedVideo ?? summaryAnalytics?.avgDurationSeconds ?? null;

    return [
      {
        label: summaryStatLabels[0],
        value: viewsValue !== null ? String(viewsValue) : '-',
        sub: '',
      },
      {
        label: summaryStatLabels[1],
        value: completionValue !== null ? `${completionValue}%` : '-',
        sub: '',
      },
      {
        label: summaryStatLabels[2],
        value: feedbackValue !== null ? String(feedbackValue) : '-',
        sub: '',
      },
      {
        label: summaryStatLabels[3],
        value: avgDurationValue !== null ? formatVideoTimestamp(avgDurationValue) : '-',
        sub: '',
      },
    ];
  }, [
    avgWatchSecondsForSelectedVideo,
    completionRateForSelectedVideo,
    feedbackDistributionTotalCount,
    isVideoSource,
    projectSummaryStats,
    selectedVideoMeta,
    summaryAnalytics,
    videoRetentionRes?.totalSessions,
  ]);

  const queryStates = [
    slidesQuery,
    slideAnalyticsQuery,
    summaryAnalyticsQuery,
    selectedVideoCommentsQuery,
    videoAnalyticsQuery,
    videoSlidesQuery,
    videoReactionBucketsQuery,
    videoRetentionQuery,
    slideRetentionQuery,
    topSlideReactionSummariesQuery,
  ];

  const isLoading = queryStates.some(
    (query) => query.isLoading || (query.isFetching && !query.data),
  );
  const firstError = isDemoProjectId ? null : queryStates.find((query) => query.isError)?.error;
  const isError = Boolean(firstError);
  const errorMessage = isAxiosError(firstError)
    ? (firstError.response?.data?.message ?? firstError.message)
    : firstError instanceof Error
      ? firstError.message
      : null;

  return {
    projectIdStr,
    projectIdNum,
    latestVideoId,
    selectedVideoId,
    hasVideo,
    isVideoSource,
    dataSourceOptions,
    selectedDataSourceKey: resolvedDataSourceKey,
    selectedDataSourceLabel,
    selectedDataSourceSubLabel,
    onSelectDataSource,
    feedbackDistributionTitle,
    feedbackDistributionCounts,
    feedbackDistributionTotalCount,

    summaryStats,

    dropOffSlides,
    dropOffTimes,

    retentionTitle,
    retentionData,
    retentionIsVideo: isVideoSource,

    topSlides,
    topSlideReactionSummaries,

    getThumb,
    getSeekSecondsForSlide,
    getSlideIdByIndex,

    recentCommentsData,

    isLoading,
    isError,
    errorMessage,
  };
}
