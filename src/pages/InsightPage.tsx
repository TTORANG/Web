import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { DonutChart, RecentCommentItem, SlideThumb, TopSlideCard } from '@/components/insight';
import { REACTION_CONFIG, createDefaultReactions } from '@/constants/reaction';
import { useSlides } from '@/hooks/queries/useSlides';
import type { Reaction } from '@/types/script';

type SummaryStat = {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down';
};

type DropOffSlide = {
  label: string;
  desc: string;
  percent: number;
  slideIndex: number;
};

type DropOffTime = {
  time: string;
  desc: string;
  count: number;
  slideIndex: number;
};

type RecentComment = {
  user: string;
  slide: number;
  slideIndex: number;
  time: string;
  text: string;
};

const cardBase = 'bg-white rounded-xl border border-gray-200 shadow-xs';
const thumbBase = 'bg-gray-200 rounded';

const summaryStats: SummaryStat[] = [
  { label: '총 조회수', value: '247', sub: '전주 대비 12%', trend: 'up' },
  { label: '평균 체류 시간', value: '4:23', sub: '총 5개 슬라이드' },
  { label: '완독률', value: '68%', sub: '전주 대비 5%', trend: 'up' },
  { label: '받은 피드백', value: '42', sub: '댓글 12, 이모지 30' },
];

const dropOffSlides: DropOffSlide[] = [
  { label: '슬라이드 4', desc: '이탈률 32% (79명 이탈)', percent: 32, slideIndex: 3 },
  { label: '슬라이드 8', desc: '이탈률 28% (47명 이탈)', percent: 28, slideIndex: 7 },
  { label: '슬라이드 6', desc: '이탈률 24% (45명 이탈)', percent: 24, slideIndex: 5 },
];

const dropOffTimes: DropOffTime[] = [
  { time: '2:05', desc: '슬라이드 4 → 5 전환 구간', count: 45, slideIndex: 3 },
  { time: '3:30', desc: '슬라이드 7 중간', count: 38, slideIndex: 6 },
  { time: '1:08', desc: '슬라이드 3 초반', count: 38, slideIndex: 2 },
];

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
    text: '동의합니다. 정말 명확하게 설명했어요.',
  },
];

export default function InsightPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: slides } = useSlides(projectId ?? '');
  const reactions = useMemo(() => {
    const base = createDefaultReactions();
    if (!slides?.length) {
      return base;
    }

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
    if (!slides?.length) {
      return [];
    }

    return slides
      .map((slide, index) => {
        const commentCount = slide.opinions?.length ?? 0;
        const reactionCount = (slide.emojiReactions ?? []).reduce(
          (sum, reaction) => sum + reaction.count,
          0,
        );

        return {
          slide,
          slideIndex: index,
          commentCount,
          reactionCount,
          total: commentCount + reactionCount,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [slides]);
  const maxDropOffCount = Math.max(...dropOffTimes.map((item) => item.count), 1);
  const getThumb = (slideIndex: number) => slides?.[slideIndex]?.thumb;

  const trendLabel = (trend: Exclude<SummaryStat['trend'], undefined>) =>
    trend === 'up' ? '↑' : '↓';
  const trendColor = (trend: Exclude<SummaryStat['trend'], undefined>) =>
    trend === 'up' ? 'text-main-variant1' : 'text-error';

  return (
    <div
      role="tabpanel"
      id="tabpanel-insight"
      aria-labelledby="tab-insight"
      className="h-full overflow-y-auto p-8"
    >
      <div className="mb-6">
        <h1 className="text-body-m-bold text-gray-800">발표 인사이트</h1>
        <p className="text-body-s text-gray-600 mt-1">발표 자료 분석 결과를 확인하세요.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {summaryStats.map((stat, idx) => (
          <div key={idx} className={`${cardBase} p-5`}>
            <h3 className="text-body-s text-gray-800 mb-2">{stat.label}</h3>
            <div className="text-2xl font-bold text-gray-800 mb-2">{stat.value}</div>
            <div
              className={`text-body-s flex items-center gap-1 ${
                stat.trend ? trendColor(stat.trend) : 'text-gray-600'
              }`}
            >
              {stat.trend && <span aria-hidden="true">{trendLabel(stat.trend)}</span>}
              <span>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`${cardBase} p-6`}>
          <h3 className="text-body-s text-gray-800 mb-4">가장 많이 이탈한 슬라이드</h3>
          <div className="space-y-4">
            {dropOffSlides.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SlideThumb
                    src={getThumb(item.slideIndex)}
                    alt={`${item.label} 썸네일`}
                    className="w-16 h-10 rounded object-cover"
                    fallbackClassName={`w-16 h-10 ${thumbBase}`}
                  />
                  <div>
                    <div className="text-sm font-bold text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </div>
                <DonutChart percent={item.percent} />
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardBase} p-6`}>
          <h3 className="text-body-s text-gray-800 mb-4">가장 많이 이탈한 영상 시간</h3>
          <div className="space-y-6">
            {dropOffTimes.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <SlideThumb
                  src={getThumb(item.slideIndex)}
                  alt={`슬라이드 ${item.slideIndex + 1} 썸네일`}
                  className="w-16 h-10 shrink-0 rounded object-cover"
                  fallbackClassName={`w-16 h-10 ${thumbBase} shrink-0`}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <div>
                      <span className="text-sm font-bold text-gray-800 mr-2">{item.time}</span>
                      <span className="text-xs text-gray-500">{item.desc}</span>
                    </div>
                    <span className="text-sm font-bold text-red-500">{item.count}명</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${Math.round((item.count / maxDropOffCount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`${cardBase} p-8 mb-6`}>
        <h3 className="text-body-s text-gray-800 mb-6">피드백 분포</h3>
        <div className="flex justify-around items-center">
          {reactions.map((react, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="text-3xl p-3 rounded-full w-16 h-16 flex items-center justify-center">
                {REACTION_CONFIG[react.type].emoji}
              </div>
              <div className="text-body-s text-gray-600">{REACTION_CONFIG[react.type].label}</div>
              <div className="text-2xl font-bold text-gray-800">{react.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-body-s text-gray-800 mb-3">가장 많은 피드백을 받은 슬라이드</h3>
        <div className="grid grid-cols-3 gap-4">
          {topSlides.map(({ slide, slideIndex, commentCount }) => {
            const reactionMetrics = (slide.emojiReactions ?? []).filter(
              (reaction) => reaction.count > 0,
            );

            return (
              <TopSlideCard
                key={slide.id}
                id={slide.id}
                title={slide.title || `슬라이드 ${slideIndex + 1}`}
                thumbUrl={getThumb(slideIndex)}
                reactionMetrics={reactionMetrics}
                commentCount={commentCount}
                cardClassName={cardBase}
                thumbFallbackClassName={thumbBase}
              />
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-body-s text-gray-800 mb-3">최근 텍스트 피드백</h3>
        <div className="space-y-3">
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
      </div>
    </div>
  );
}
