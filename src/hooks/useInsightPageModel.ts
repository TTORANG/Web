// src/hooks/useInsightPageModel.ts
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { isAxiosError } from 'axios';

import type {
  SlideAnalyticsDto,
  SlideRetentionDto,
  VideoExitAnalyticsDto,
  VideoRetentionDto,
} from '@/api/dto/analytics.dto';
import type { ChartDataPoint, InsightModel, InsightTopSlide } from '@/components/insight/types';
import {
  DEMO_ANALYTICS_SUMMARY,
  DEMO_RECENT_COMMENTS,
  DEMO_SLIDE_ANALYTICS,
  DEMO_SLIDE_RETENTION,
  DEMO_VIDEO_EXIT_ANALYTICS,
  DEMO_VIDEO_ID,
  DEMO_VIDEO_RETENTION,
  DEMO_VIDEO_SLIDES_TIMELINE,
  isDemoProject,
} from '@/constants/demoProject';
import {
  usePresentationAnalyticsSummary,
  useRecentComments,
  useSlideAnalytics,
  useSlideRetention,
  useVideoAnalytics,
  useVideoRetention,
} from '@/hooks/queries/useAnalytics';
import { useSlideReactionSummaries } from '@/hooks/queries/useReaction.ts';
import { useSlides } from '@/hooks/queries/useSlides';
import { useVideoSlides } from '@/hooks/queries/useVideoSlides';
import type { DropOffSlide, DropOffTime, SummaryStat } from '@/types/insight';
import type { SlideListItem } from '@/types/slide';
import { formatVideoTimestamp } from '@/utils/format';
import { getSlideTitle } from '@/utils/slideTitle';
import { getSlideIndexFromTime } from '@/utils/video';

const summaryStatLabels = ['총 조회수', '완독률', '받은 피드백', '평균 시청 시간'] as const;

const emptySummaryStats: SummaryStat[] = summaryStatLabels.map((label) => ({
  label,
  value: '-',
  sub: '',
}));

const normalizeRate = (rate: number) => (rate <= 1 ? rate * 100 : rate);

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
  const recentCommentsQuery = useRecentComments(projectIdNum, { enabled: !isDemoProjectId });

  const { data: slides } = slidesQuery;
  const slideAnalytics = isDemoProjectId ? DEMO_SLIDE_ANALYTICS : slideAnalyticsQuery.data;
  const summaryAnalytics = isDemoProjectId ? DEMO_ANALYTICS_SUMMARY : summaryAnalyticsQuery.data;
  const recentCommentsData = isDemoProjectId ? DEMO_RECENT_COMMENTS : recentCommentsQuery.data;

  const latestVideoId =
    (isDemoProjectId
      ? DEMO_VIDEO_ID
      : summaryAnalytics?.videoIds?.[summaryAnalytics.videoIds.length - 1]) ?? null;
  const videoIdNum = latestVideoId ? Number(latestVideoId) : 0;
  const hasVideo = isDemoProjectId ? true : !!videoIdNum;

  const videoAnalyticsQuery = useVideoAnalytics(videoIdNum, { enabled: !isDemoProjectId });
  const videoSlidesQuery = useVideoSlides(videoIdNum, { enabled: !isDemoProjectId });
  const videoExitAnalytics = isDemoProjectId ? DEMO_VIDEO_EXIT_ANALYTICS : videoAnalyticsQuery.data;
  const videoSlidesTimeline = isDemoProjectId ? DEMO_VIDEO_SLIDES_TIMELINE : videoSlidesQuery.data;

  // ---- Summary stats ----
  const computedSummaryStats = useMemo<SummaryStat[]>(() => {
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

  const summaryStats = hasVideo
    ? computedSummaryStats
    : computedSummaryStats.filter((stat) => stat.label !== summaryStatLabels[3]);

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

  // ---- Top slides ----
  const topSlides = useMemo<InsightTopSlide[]>(() => {
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
  }, [slideAnalytics, slideDataMaps]);

  const topSlideIds = useMemo(() => topSlides.map((item) => item.slideId), [topSlides]);
  const topSlideReactionSummariesQuery = useSlideReactionSummaries(topSlideIds);
  const { data: topSlideReactionSummaries } = topSlideReactionSummariesQuery;

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

  const dropOffSlides: DropOffSlide[] = useMemo(() => {
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
  }, [slideAnalytics]);

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
  const videoRetentionQuery = useVideoRetention(videoIdNum, { enabled: !isDemoProjectId });
  const slideRetentionQuery = useSlideRetention(projectIdNum, { enabled: !isDemoProjectId });
  const videoRetentionRes = isDemoProjectId ? DEMO_VIDEO_RETENTION : videoRetentionQuery.data;
  const slideRetentionRes = isDemoProjectId ? DEMO_SLIDE_RETENTION : slideRetentionQuery.data;

  const videoChartData = useMemo<ChartDataPoint[]>(() => {
    if (!videoRetentionRes?.videoRetention) return [];
    return videoRetentionRes.videoRetention.map((item: VideoRetentionDto) => ({
      label: formatVideoTimestamp(item.timestampMs / 1000), // x축: 00:00
      value: Math.round(normalizeRate(item.retentionRate)), // y축: 0~100%
      tooltipTitle: formatVideoTimestamp(item.timestampMs / 1000),
      sessionCount: item.sessionCount,
      originalTime: item.timestampMs,
    }));
  }, [videoRetentionRes]);

  const slideChartData = useMemo<ChartDataPoint[]>(() => {
    if (!slideRetentionRes?.slideRetention) return [];
    return slideRetentionRes.slideRetention.map((item: SlideRetentionDto) => ({
      label: `S${item.slideNum}`, // x축: S1, S2
      value: Math.round(normalizeRate(item.retentionRate)),
      tooltipTitle: getSlideTitle(item.title, item.slideNum), // 툴팁: 제목
      sessionCount: item.sessionCount,
    }));
  }, [slideRetentionRes]);

  const retentionTitle = hasVideo ? '영상 시청 잔존률' : '슬라이드별 청중 잔존률';
  const retentionData = hasVideo ? videoChartData : slideChartData;

  const queryStates = [
    slidesQuery,
    slideAnalyticsQuery,
    summaryAnalyticsQuery,
    recentCommentsQuery,
    videoAnalyticsQuery,
    videoSlidesQuery,
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
    hasVideo,

    summaryStats,

    dropOffSlides,
    dropOffTimes,

    retentionTitle,
    retentionData,
    retentionIsVideo: hasVideo,

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
