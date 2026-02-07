import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
// 1. Recharts 컴포넌트 임포트
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';

import { getSlideReactionSummary } from '@/api/endpoints/reactions';
import { queryKeys } from '@/api/queryClient';
import {
  DropOffAnalysisSection,
  FeedbackDistributionSection,
  RecentCommentItem,
  SummaryStatsSection,
  TopSlideCard,
} from '@/components/insight';
import { createDefaultReactions } from '@/constants/reaction';
import { useSlides } from '@/hooks/queries/useSlides';
import {
  useProjectAnalyticsSummary,
  useRecordExit,
  // 🧷안쓸건데 왜 훅이 있음???
  useSlideAnalytics,
  useSlideRetention,
  useVideoAnalytics,
  useVideoRetention,
} from '@/hooks/useAnalytics';
import type { DropOffSlide, DropOffTime, SummaryStat } from '@/types/insight';
import type { Reaction } from '@/types/script';
import type { SlideListItem } from '@/types/slide';
import { formatVideoTimestamp } from '@/utils/format';
import { getSlideIndexFromTime } from '@/utils/video';

// --- 타입 및 스타일 정의 ---

type RecentComment = {
  user: string;
  slide: number;
  slideIndex: number;
  time: string;
  text: string;
};

// 툴팁용 타입
interface ChartDataPoint {
  label: string;
  value: number;
  tooltipTitle: string;
  sessionCount: number;
  originalTime?: number; // 영상 시간 계산용
}

// 디자인을 위해 스타일을 조금 더 부드럽게 조정했습니다.
const thumbBase = 'bg-gray-100 rounded-lg aspect-video';
const FALLBACK_SLIDE_DURATION_SECONDS = 10;

// --- 더미 데이터 (사진 수치 반영) ---
const summaryStatLabels = ['총 조회수', '완료율', '받은 피드백', '평균 체류 시간'] as const;
const emptySummaryStats: SummaryStat[] = summaryStatLabels.map((label) => ({
  label,
  value: '-',
  sub: '',
}));

const recentComments: RecentComment[] = [
  { user: '익명 사용자', slide: 1, slideIndex: 0, time: '0:15', text: '이 부분 설명이 명확해요!' },
  { user: '김철수', slide: 2, slideIndex: 1, time: '0:45', text: '좋은 발표였습니다.' },
  {
    user: '이영희',
    slide: 3,
    slideIndex: 2,
    time: '1:30',
    text: '데이터 해석 부분이 인상적이에요.',
  },
  {
    user: '박민수',
    slide: 4,
    slideIndex: 3,
    time: '1:32',
    text: '동의합니다! 명확한 설명이었어요.',
  },
];

// --- 커스텀 툴팁 컴포넌트 ---
const CustomTooltip = ({
  active,
  payload,
  label,
  hasVideo,
}: TooltipContentProps<ValueType, NameType> & { hasVideo: boolean }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
        <p className="mb-1 text-xs font-semibold text-gray-500">
          {hasVideo ? `재생 시간: ${label}` : `슬라이드: ${data.tooltipTitle}`}
        </p>
        <div className="flex items-end gap-2">
          <p className="text-sm font-bold text-indigo-600">잔존율 {data.value}%</p>
          <span className="text-xs text-gray-400">({data.sessionCount}명)</span>
        </div>
      </div>
    );
  }
  return null;
};

// --- 컴포넌트 시작 ---

const normalizeRate = (rate: number) => (rate <= 1 ? rate * 100 : rate);

export default function InsightPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: slides } = useSlides(projectId ?? '');
  const { data: slideAnalytics } = useSlideAnalytics(projectId ?? '');
  const { data: summaryAnalytics } = useProjectAnalyticsSummary(projectId ?? '');
  const videoIdStr = summaryAnalytics?.videoIds?.[0] ?? '';
  const videoIdNum = videoIdStr ? Number(videoIdStr) : 0;
  const hasVideo = !!videoIdNum;
  const { data: videoExitAnalytics } = useVideoAnalytics(videoIdNum);
  const computedSummaryStats = useMemo(() => {
    if (!summaryAnalytics) return emptySummaryStats;

    const completionRate =
      summaryAnalytics.completionRate <= 1
        ? summaryAnalytics.completionRate * 100
        : summaryAnalytics.completionRate;

    return [
      { label: summaryStatLabels[0], value: String(summaryAnalytics.totalViews), sub: '' },
      { label: summaryStatLabels[1], value: `${Math.round(completionRate)}%`, sub: '' },
      {
        label: summaryStatLabels[2],
        value: String(summaryAnalytics.totalFeedbackCount),
        sub: '',
      },
      {
        label: summaryStatLabels[3],
        value: formatVideoTimestamp(summaryAnalytics.avgDurationSeconds),
        sub: '',
      },
    ];
  }, [summaryAnalytics]);

  const visibleSummaryStats = hasVideo
    ? computedSummaryStats
    : computedSummaryStats.filter((stat) => stat.label !== summaryStatLabels[3]);

  const slideList = useMemo(() => (Array.isArray(slides) ? slides : []), [slides]);

  const reactions = useMemo(() => {
    const base = createDefaultReactions();
    if (!slideList.length) return base;

    const totals = new Map<Reaction['type'], number>();
    const analyticsSlideIds = new Set((slideAnalytics?.slides ?? []).map((item) => item.slideId));
    const targetSlides =
      analyticsSlideIds.size > 0
        ? slideList.filter((slide) => analyticsSlideIds.has(slide.slideId))
        : slideList;

    targetSlides.forEach((slide) => {
      slide.emojiReactions?.forEach((reaction) => {
        totals.set(reaction.type, (totals.get(reaction.type) ?? 0) + reaction.count);
      });
    });

    return base.map((reaction) => ({
      ...reaction,
      count: totals.get(reaction.type) ?? 0,
    }));
  }, [slideList, slideAnalytics]);

  const slideDataMaps = useMemo(() => {
    const slideIndexById = new Map<string, number>();
    const slideById = new Map<string, SlideListItem>();

    slideList.forEach((slide, index) => {
      slideIndexById.set(slide.slideId, index);
      slideById.set(slide.slideId, slide);
    });

    return { slideIndexById, slideById };
  }, [slideList]);

  const topSlides = useMemo(() => {
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
  const { data: topSlideReactionSummaries } = useQuery({
    queryKey: queryKeys.reactions.summary(topSlideIds.join('|')),
    queryFn: () => Promise.all(topSlideIds.map((slideId) => getSlideReactionSummary(slideId))),
    enabled: topSlideIds.length > 0,
  });

  const getThumb = (slideIndex: number) => slideList[slideIndex]?.imageUrl;

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

  // 잔존율 데이터 Fetching
  // 1. 영상 잔존율 (영상이 있을 때만 호출)
  const { data: videoRetentionRes } = useVideoRetention(videoIdNum);

  // 2. 슬라이드 잔존율 (영상이 없을 때 호출 - 또는 항상 호출해도 됨)
  // hasVideo가 true면 굳이 슬라이드 잔존율을 안 보여줄거라면 enabled 처리를 해도 됩니다.
  const { data: slideRetentionRes } = useSlideRetention(projectId ?? '');

  // --- Chart Data 가공 ---
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

  const renderRetentionChart = (title: string, data: ChartDataPoint[], isVideo: boolean) => (
    <div className="flex w-full flex-col gap-6 rounded-lg border border-gray-200 bg-white px-5 pb-8 pt-4">
      <h3 className="text-body-l-bold text-gray-800">{title}</h3>
      <div className="h-100 w-full px-6">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient
                  id={`colorRate-${isVideo ? 'video' : 'slide'}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="var(--color-main)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-main)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-gray-400)"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-gray-600)', fontWeight: 600 }}
                dy={10}
                interval={isVideo ? 'preserveStartEnd' : 0}
                minTickGap={30}
              />

              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-gray-600)' }}
                ticks={[0, 25, 50, 75, 100]}
                unit="%"
              />

              <Tooltip
                content={(props) => <CustomTooltip {...props} hasVideo={isVideo} />}
                cursor={{ stroke: 'var(--color-error)', strokeDasharray: '4 4', strokeWidth: 1 }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-main)"
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorRate-${isVideo ? 'video' : 'slide'})`}
                dot={
                  !isVideo
                    ? { r: 4, fill: '#fff', stroke: 'var(--color-main)', strokeWidth: 2 }
                    : false
                }
                activeDot={{
                  r: 5,
                  fill: 'var(--color-error)',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
            <p>데이터를 분석 중이거나 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      role="tabpanel"
      id="tabpanel-insight"
      aria-labelledby="tab-insight"
      className="h-full overflow-y-auto bg-gray-100"
    >
      <div className="flex flex-col gap-6 px-18 py-8">
        {/* 헤더 */}
        <div className="flex flex-col gap-1">
          <h1 className="text-body-l-bold text-gray-800">발표 인사이트</h1>
          <p className="text-body-s text-gray-600">발표 자료 분석 결과를 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="flex flex-col gap-4">
          <SummaryStatsSection stats={visibleSummaryStats} />

          {/* 이탈 분석 */}
          <DropOffAnalysisSection
            dropOffSlides={dropOffSlides}
            dropOffTimes={dropOffTimes}
            getThumb={getThumb}
            showVideoDropOff={hasVideo}
          />

          {/* 잔존률 차트 */}
          {renderRetentionChart(
            hasVideo ? '영상 시청 잔존률' : '슬라이드별 청중 잔존률',
            hasVideo ? videoChartData : slideChartData,
            hasVideo,
          )}

          <div className="flex flex-wrap items-start justify-between gap-6 py-4">
            <FeedbackDistributionSection reactions={reactions} />

            <div className="flex min-w-80 flex-1 basis-160 flex-col gap-6">
              <h3 className="text-body-l-bold text-gray-800">가장 많은 피드백을 받은 슬라이드</h3>
              <div className="flex flex-wrap gap-4">
                {topSlides.map(({ slideId, slide, slideIndex, title }, index) => {
                  const summary = topSlideReactionSummaries?.[index];
                  const baseReactions = createDefaultReactions();
                  const summaryReactions = summary
                    ? baseReactions.map((reaction) => ({
                        ...reaction,
                        count: summary[reaction.type] ?? 0,
                      }))
                    : (slide?.emojiReactions ?? baseReactions);
                  const reactionMetrics = summaryReactions.filter((reaction) => reaction.count > 0);

                  return (
                    <TopSlideCard
                      key={slideId ?? slide?.slideId ?? `slide-${slideIndex}`}
                      title={title}
                      thumbUrl={getThumb(slideIndex)}
                      reactionMetrics={reactionMetrics}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <div className="relative">
              <div
                className={`flex flex-col gap-2 ${!hasVideo ? 'blur-[3px] pointer-events-none select-none' : ''}`}
              >
                <h3 className="text-body-l-bold text-gray-800">최근 댓글 피드백</h3>
                {recentComments.map((comment, idx) => (
                  <RecentCommentItem
                    key={idx}
                    user={comment.user}
                    slideLabel={`슬라이드 ${comment.slide}`}
                    time={comment.time}
                    text={comment.text}
                    thumbUrl={getThumb(comment.slideIndex)}
                    thumbFallbackClassName={thumbBase}
                  />
                ))}
              </div>

              {/* ✅ 오버레이: 이 영역 안에서만 덮음 */}
              {!hasVideo && (
                <div className="absolute inset-0 z-10 flex items-center justify-center text-center pointer-events-auto">
                  <div className="px-6 py-5">
                    <p className="text-body-l-bold text-gray-800">
                      영상을 녹화하면 더 자세한 분석을 받을 수 있어요
                    </p>
                    <ul className="mt-3 mx-auto w-fit text-left text-body-m text-gray-800">
                      <li>• 시청 구간별 이탈률 분석</li>
                      <li>• 영상 잔존율 그래프</li>
                      <li>• 타임라인 기반 댓글 피드백</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
