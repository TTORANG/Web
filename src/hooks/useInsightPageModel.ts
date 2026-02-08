// src/hooks/useInsightPageModel.ts
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { ChartDataPoint, InsightModel, InsightTopSlide } from '@/components/insight/types';
import { useSlideReactionSummaries } from '@/hooks/queries/useReaction.ts';
import { useSlides } from '@/hooks/queries/useSlides';
import {
  useProjectAnalyticsSummary,
  useRecentComments,
  useSlideAnalytics,
  useSlideRetention,
  useVideoAnalytics,
  useVideoRetention,
} from '@/hooks/useAnalytics';
import type { DropOffSlide, DropOffTime, SummaryStat } from '@/types/insight';
import type { SlideListItem } from '@/types/slide';
import { formatVideoTimestamp } from '@/utils/format';
import { getSlideIndexFromTime } from '@/utils/video';

const FALLBACK_SLIDE_DURATION_SECONDS = 10;
const summaryStatLabels = ['총 조회수', '완료율', '받은 피드백', '평균 체류 시간'] as const;

const emptySummaryStats: SummaryStat[] = summaryStatLabels.map((label) => ({
  label,
  value: '-',
  sub: '',
}));

const normalizeRate = (rate: number) => (rate <= 1 ? rate * 100 : rate);

export function useInsightPageModel(): InsightModel {
  const { projectId } = useParams<{ projectId: string }>();
  const projectIdStr = projectId ?? '';
  const projectIdNum = projectIdStr ? Number(projectIdStr) : 0;

  const { data: slides } = useSlides(projectIdStr);
  const { data: slideAnalytics } = useSlideAnalytics(projectIdNum);
  const { data: summaryAnalytics } = useProjectAnalyticsSummary(projectIdNum);
  const { data: recentCommentsData } = useRecentComments(projectIdNum);

  const videoIdStr = summaryAnalytics?.videoIds?.[0] ?? '';
  const videoIdNum = videoIdStr ? Number(videoIdStr) : 0;
  const hasVideo = !!videoIdNum;

  const { data: videoExitAnalytics } = useVideoAnalytics(videoIdNum);

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

  const convertGcsToHttpUrl = (gcsUrl?: string) =>
    gcsUrl?.startsWith('gs://') ? `https://storage.googleapis.com/${gcsUrl.slice(5)}` : gcsUrl;

  const getThumb = (slideIndex: number) => convertGcsToHttpUrl(slideList[slideIndex]?.imageUrl);

  // ---- Top slides ----
  const topSlides = useMemo<InsightTopSlide[]>(() => {
    const analyticsSlides = slideAnalytics?.slides ?? [];
    if (!analyticsSlides.length) return [];

    const { slideIndexById, slideById } = slideDataMaps;

    return analyticsSlides
      .slice()
      .sort((a, b) => b.feedbackCount - a.feedbackCount)
      .slice(0, 3)
      .map((item) => {
        const slide = slideById.get(item.slideId);
        const slideIndex = slideIndexById.get(item.slideId) ?? Math.max(0, item.slideNum - 1);
        const title = slide?.title || item.title || `슬라이드 ${slideIndex + 1}`;

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
  const { data: topSlideReactionSummaries } = useSlideReactionSummaries(topSlideIds);

  // ---- Drop-off ----
  const slideChangeTimes = useMemo(() => {
    if (!slides?.length) return [];
    return slides.map((slide, index) =>
      Number.isFinite(slide.startTime)
        ? (slide.startTime ?? 0)
        : index * FALLBACK_SLIDE_DURATION_SECONDS,
    );
  }, [slides]);

  const dropOffSlides: DropOffSlide[] = useMemo(() => {
    const items = slideAnalytics?.slides ?? [];
    return items
      .slice()
      .sort((a, b) => b.exitCount - a.exitCount)
      .slice(0, 3)
      .map((item) => ({
        label: `슬라이드 ${item.slideNum}`,
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
    const items = videoExitAnalytics?.exits ?? [];
    return items
      .slice()
      .sort((a, b) => b.exitCount - a.exitCount)
      .slice(0, 3)
      .map((item) => {
        const seconds = item.timestampMs / 1000;
        const slideIndex =
          slides?.length && slideChangeTimes.length
            ? getSlideIndexFromTime(seconds, slideChangeTimes, slides.length - 1)
            : 0;

        return {
          time: formatVideoTimestamp(seconds),
          desc: slides?.length ? `슬라이드 ${slideIndex + 1}` : '슬라이드',
          count: item.exitCount,
          slideIndex,
        };
      });
  }, [videoExitAnalytics, slideChangeTimes, slides]);

  // ---- Retention(잔존율) ----
  const { data: videoRetentionRes } = useVideoRetention(videoIdNum);
  const { data: slideRetentionRes } = useSlideRetention(projectIdNum);

  const videoChartData = useMemo<ChartDataPoint[]>(() => {
    if (!videoRetentionRes?.videoRetention) return [];
    return videoRetentionRes.videoRetention.map((item) => ({
      label: formatVideoTimestamp(item.timestampMs / 1000), // x축: 00:00
      value: Math.round(normalizeRate(item.retentionRate)), // y축: 0~100%
      tooltipTitle: formatVideoTimestamp(item.timestampMs / 1000),
      sessionCount: item.sessionCount,
      originalTime: item.timestampMs,
    }));
  }, [videoRetentionRes]);

  const slideChartData = useMemo<ChartDataPoint[]>(() => {
    if (!slideRetentionRes?.slideRetention) return [];
    return slideRetentionRes.slideRetention.map((item) => ({
      label: `S${item.slideNum}`, // x축: S1, S2
      value: Math.round(normalizeRate(item.retentionRate)),
      tooltipTitle: item.title || `슬라이드 ${item.slideNum}`, // 툴팁: 제목
      sessionCount: item.sessionCount,
    }));
  }, [slideRetentionRes]);

  const retentionTitle = hasVideo ? '영상 시청 잔존률' : '슬라이드별 청중 잔존률';
  const retentionData = hasVideo ? videoChartData : slideChartData;

  return {
    projectIdStr,
    projectIdNum,
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

    recentCommentsData,
  };
}
