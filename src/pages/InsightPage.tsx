import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  DropOffAnalysisSection,
  FeedbackDistributionSection,
  RecentCommentItem,
  SummaryStatsSection,
  TopSlideCard,
} from '@/components/insight';
import { createDefaultReactions } from '@/constants/reaction';
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

      <SummaryStatsSection stats={summaryStats} cardClassName={cardBase} />

      <DropOffAnalysisSection
        cardClassName={cardBase}
        thumbClassName={thumbBase}
        dropOffSlides={dropOffSlides}
        dropOffTimes={dropOffTimes}
        getThumb={getThumb}
        maxDropOffCount={maxDropOffCount}
      />

      <FeedbackDistributionSection cardClassName={cardBase} reactions={reactions} />

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
