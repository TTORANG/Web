import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

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
  useProjectVideos,
  useSlideAnalytics,
  useSummaryAnalytics,
  useVideoExitAnalytics,
} from '@/hooks/useAnalytics';
import type { DropOffSlide, DropOffTime, SummaryStat } from '@/types/insight';
import type { Reaction } from '@/types/script';
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

// 디자인을 위해 스타일을 조금 더 부드럽게 조정했습니다.
const cardBase = 'bg-white rounded-xl border border-gray-100 shadow-sm p-6';
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

// Recharts용 데이터 (그라데이션 그래프용)
const retentionData = [
  { time: '0:00', rate: 100 },
  { time: '1:00', rate: 90 },
  { time: '1:40', rate: 80 }, // 급격한 이탈 지점
  { time: '2:00', rate: 80 },
  { time: '3:00', rate: 70 },
  { time: '3:30', rate: 75 },
  { time: '4:00', rate: 65 },
  { time: '5:00', rate: 65 },
];

const slideRetentionData = [
  { time: 'S1', rate: 100 },
  { time: 'S2', rate: 92 },
  { time: 'S3', rate: 86 },
  { time: 'S4', rate: 80 },
  { time: 'S5', rate: 80 },
  { time: 'S6', rate: 70 },
  { time: 'S7', rate: 75 },
  { time: 'S8', rate: 65 },
  { time: 'S9', rate: 65 },
  { time: 'S10', rate: 65 },
];

// --- 컴포넌트 시작 ---

export default function InsightPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: slides } = useSlides(projectId ?? '');

  const { data: projectVideos } = useProjectVideos(projectId ?? '');
  const videoId = projectVideos?.videos?.[0]?.id ?? '';
  const hasVideo = !!videoId;
  const { data: slideAnalytics } = useSlideAnalytics(projectId ?? '');
  const { data: videoExitAnalytics } = useVideoExitAnalytics(videoId);
  const { data: summaryAnalytics } = useSummaryAnalytics(projectId ?? '');
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
        commentCount: slide.opinions?.length ?? 0,
        reactionCount: (slide.emojiReactions ?? []).reduce((sum, r) => sum + r.count, 0),
        total:
          (slide.opinions?.length ?? 0) +
          (slide.emojiReactions ?? []).reduce((sum, r) => sum + r.count, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [slides]);

  const getThumb = (slideIndex: number) => slides?.[slideIndex]?.imageUrl;

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
        percent: Math.round(item.exitRate),
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

  return (
    <div
      role="tabpanel"
      id="tabpanel-insight"
      aria-labelledby="tab-insight"
      className="h-full overflow-y-auto p-8 bg-[#FBFCFE]" // 배경색을 연한 톤으로 변경하여 카드 강조
    >
      <div className="mb-6">
        <h1 className="text-body-l-bold text-gray-800">발표 인사이트</h1>
        <p className="text-body-s text-gray-600 mt-1">발표 자료 분석 결과를 확인하세요.</p>
      </div>

      <SummaryStatsSection
        stats={visibleSummaryStats}
        cardClassName={cardBase}
        columns={hasVideo ? 4 : 3}
      />

      {/* 기존 이탈 분석 섹션 */}
      <DropOffAnalysisSection
        cardClassName={cardBase}
        thumbClassName={thumbBase}
        dropOffSlides={dropOffSlides}
        dropOffTimes={dropOffTimes}
        getThumb={getThumb}
        showVideoDropOff={hasVideo}
      />

      {/* 잔존률 차트 (단독 1열) */}
      <div className={`${cardBase} mt-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-body-l-bold text-gray-800">
            {hasVideo ? '영상 시청 잔존률' : '슬라이드별 청중 잔존률'}
          </h3>
        </div>

        <div className="h-[280px] w-full px-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hasVideo ? retentionData : slideRetentionData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              {/* 그라데이션 정의 */}
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-main)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-main)" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* 배경 그리드 (점선) */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-gray-400)"
              />

              {/* X축 (시간) */}
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-gray-600)', fontWeight: 600 }}
                dy={10}
              />

              {/* Y축 (퍼센트) */}
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-gray-600)' }}
                ticks={[0, 25, 50, 75, 100]}
                unit="%"
              />

              {/* 툴팁 */}
              <Tooltip
                cursor={{ stroke: 'var(--color-error)', strokeDasharray: '4 4', strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />

              {/* 메인 데이터 영역 (곡선 + 채우기) */}
              <Area
                type="linear"
                dataKey="rate"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRate)"
                dot={hasVideo ? false : { r: 4, fill: '#fff', stroke: '#6366F1', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: 'var(--color-error)', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 items-stretch">
        <FeedbackDistributionSection reactions={reactions} />

        <div className="h-full flex flex-col">
          <h3 className="text-body-l-bold text-gray-800 mb-4">가장 많은 피드백을 받은 슬라이드</h3>
          <div className="grid grid-cols-3 gap-3 items-start">
            {topSlides.map(({ slide, slideIndex, commentCount }) => {
              const reactionMetrics = (slide.emojiReactions ?? []).filter(
                (reaction) => reaction.count > 0,
              );

              return (
                <TopSlideCard
                  key={slide.slideId}
                  title={slide.title || `슬라이드 ${slideIndex + 1}`}
                  thumbUrl={getThumb(slideIndex)}
                  reactionMetrics={reactionMetrics}
                  commentCount={commentCount}
                  cardClassName="bg-white rounded-xl border border-gray-100 shadow-sm"
                  thumbFallbackClassName={thumbBase}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 relative">
        <h3 className="text-body-l-bold text-gray-800 mb-4">최근 댓글 피드백</h3>
        <div className={`space-y-3 ${!hasVideo ? 'blur-sm' : ''}`}>
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
        {!hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <p className="text-body-l-bold text-gray-800">
                영상을 녹화하면 더 자세한 분석을 받을 수 있어요
              </p>
              <ul className="text-body-m text-gray-800 mt-3 mx-auto w-fit text-left">
                <li>• 시청 구간별 이탈률 분석</li>
                <li>• 영상 잔존율 그래프</li>
                <li>• 타임라인 기반 댓글 피드백</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
