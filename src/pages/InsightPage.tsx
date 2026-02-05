import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  DropOffAnalysisSection,
  FeedbackDistributionSection,
  RecentCommentItem,
  SummaryStatsSection,
  TopSlideCard,
} from '@/components/insight';
import { createDefaultReactions } from '@/constants/reaction';
import { useSlides } from '@/hooks/queries/useSlides';
import { useSummaryAnalytics } from '@/hooks/useAnalytics';
import type { DropOffSlide, DropOffTime, SummaryStat } from '@/types/insight';
import type { Reaction } from '@/types/script';
import { formatVideoTimestamp } from '@/utils/format';

type RecentComment = {
  user: string;
  slide: number;
  slideIndex: number;
  time: string;
  text: string;
};

// 더미 데이터
const summaryStatLabels = ['총 조회수', '완독률', '받은 피드백', '평균 시청 시간'] as const;
const emptySummaryStats: SummaryStat[] = [
  { label: '총 조회수', value: '247', trendValue: '12% 지난주 대비', trend: 'up' },
  { label: '완독률', value: '68%', trendValue: '5% 지난주 대비', trend: 'down' },
  { label: '받은 피드백', value: '42', sub: '댓글 12, 이모지 30' },
  { label: '평균 시청 시간', value: '4:23', sub: '슬라이드당' },
];

const dropOffSlides: DropOffSlide[] = [
  { label: '슬라이드 4', desc: '79명 이탈', percent: 32, slideIndex: 3 },
  { label: '슬라이드 8', desc: '47명 이탈', percent: 28, slideIndex: 7 },
  { label: '슬라이드 6', desc: '45명 이탈', percent: 24, slideIndex: 5 },
];

const dropOffTimes: DropOffTime[] = [
  { time: '2:05', desc: '슬라이드 5', count: 45, slideIndex: 4 },
  { time: '3:30', desc: '슬라이드 7', count: 38, slideIndex: 6 },
  { time: '1:08', desc: '슬라이드 3', count: 45, slideIndex: 2 },
];

const recentComments: RecentComment[] = [
  { user: '익명 사용자', slide: 1, slideIndex: 0, time: '0:15', text: '이 부분 설명이 명확해요!' },
  { user: '김철수', slide: 2, slideIndex: 1, time: '0:45', text: '좋은 발표였습니다' },
  {
    user: '이영희',
    slide: 3,
    slideIndex: 2,
    time: '1:30',
    text: '데이터 해석 부분이 인상적이었습니다',
  },
  {
    user: '박민수',
    slide: 4,
    slideIndex: 3,
    time: '1:32',
    text: '동의합니다! 정말 명확한 설명이었어요',
  },
];

const retentionData = [
  { time: '0:00', rate: 100 },
  { time: '1:00', rate: 90 },
  { time: '2:00', rate: 80 },
  { time: '3:00', rate: 70 },
  { time: '4:00', rate: 65 },
  { time: '5:00', rate: 65 },
];

export default function InsightPage() {
  const hasVideo = true;
  const { projectId } = useParams<{ projectId: string }>();
  const { data: slides } = useSlides(projectId ?? '');
  const { data: summaryAnalytics } = useSummaryAnalytics(projectId ?? '');

  const computedSummaryStats = useMemo(() => {
    if (!summaryAnalytics) return emptySummaryStats;

    const completionRate =
      summaryAnalytics.completionRate <= 1
        ? summaryAnalytics.completionRate * 100
        : summaryAnalytics.completionRate;

    return [
      {
        label: summaryStatLabels[0],
        value: String(summaryAnalytics.totalViews),
        trendValue: '12% 지난주 대비',
        trend: 'up' as const,
      },
      {
        label: summaryStatLabels[1],
        value: `${Math.round(completionRate)}%`,
        trendValue: '5% 지난주 대비',
        trend: 'down' as const,
      },
      {
        label: summaryStatLabels[2],
        value: String(summaryAnalytics.totalFeedbackCount),
        sub: '댓글 12, 이모지 30',
      },
      {
        label: summaryStatLabels[3],
        value: formatVideoTimestamp(summaryAnalytics.avgDurationSeconds),
        sub: '슬라이드당',
      },
    ];
  }, [summaryAnalytics]);

  const visibleSummaryStats = hasVideo
    ? computedSummaryStats
    : computedSummaryStats.filter((stat) => stat.label !== summaryStatLabels[3]);

  const reactions = useMemo(() => {
    const base = createDefaultReactions();
    if (!slides?.length) return base;

    const totals = new Map<Reaction['type'], number>();
    slides.forEach((slide) => {
      slide.emojiReactions?.forEach((reaction) => {
        totals.set(reaction.type, (totals.get(reaction.type) ?? 0) + reaction.count);
      });
    });

    return base.map((reaction) => ({
      ...reaction,
      count: totals.get(reaction.type) ?? 0,
    }));
  }, [slides]);

  const topSlides = useMemo(() => {
    if (!slides?.length) return [];
    return slides
      .map((slide, index) => ({
        slide,
        slideIndex: index,
        reactionCount: (slide.emojiReactions ?? []).reduce((sum, r) => sum + r.count, 0),
        total:
          (slide.opinions?.length ?? 0) +
          (slide.emojiReactions ?? []).reduce((sum, r) => sum + r.count, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [slides]);

  const getThumb = (slideIndex: number) => slides?.[slideIndex]?.imageUrl;

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
          <div className="flex w-full flex-col gap-6 rounded-lg border border-gray-200 bg-white px-5 pb-8 pt-4">
            <h3 className="text-body-l-bold text-gray-800">영상 시청 잔존률</h3>
            <div className="h-100 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={retentionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-main)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-main)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-gray-200)"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14, fill: 'var(--color-gray-600)', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14, fill: 'var(--color-gray-600)' }}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(value) => `${value}%`}
                    width={50}
                  />
                  <Tooltip
                    cursor={{
                      stroke: 'var(--color-error)',
                      strokeDasharray: '4 4',
                      strokeWidth: 1,
                    }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'var(--color-white)',
                      color: 'var(--color-gray-800)',
                    }}
                    labelStyle={{ color: 'var(--color-gray-800)' }}
                    itemStyle={{ color: 'var(--color-gray-800)' }}
                  />
                  <Area
                    type="linear"
                    dataKey="rate"
                    stroke="var(--color-main)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: 'var(--color-error)',
                      stroke: 'var(--color-white)',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 피드백 분포 + 피드백 TOP 슬라이드 */}
          <div className="flex flex-wrap items-start justify-between gap-6 py-4">
            <FeedbackDistributionSection reactions={reactions} />

            <div className="flex min-w-80 flex-1 basis-160 flex-col gap-6">
              <h3 className="text-body-l-bold text-gray-800">가장 많은 피드백을 받은 슬라이드</h3>
              <div className="flex flex-wrap gap-4">
                {topSlides.map(({ slide, slideIndex }) => {
                  const reactionMetrics = (slide.emojiReactions ?? []).filter(
                    (reaction) => reaction.count > 0,
                  );
                  return (
                    <TopSlideCard
                      key={slide.slideId}
                      title={slide.title || `슬라이드 ${slideIndex + 1}`}
                      thumbUrl={getThumb(slideIndex)}
                      reactionMetrics={reactionMetrics}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* 최근 댓글 피드백 */}
          <div className="flex w-full flex-col gap-4">
            <h3 className="text-body-l-bold text-gray-800">최근 댓글 피드백</h3>
            <div className="flex flex-col gap-2">
              {recentComments.map((comment, idx) => (
                <RecentCommentItem
                  key={idx}
                  user={comment.user}
                  slideLabel={`슬라이드 ${comment.slide}`}
                  time={comment.time}
                  text={comment.text}
                  thumbUrl={getThumb(comment.slideIndex)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
