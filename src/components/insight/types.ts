// src/components/insight/types.ts
import type { ReadRecentCommentListResponseDto } from '@/api/dto/analytics.dto';
import type { DropOffSlide, DropOffTime, SummaryStat } from '@/types/insight';
import type { ReactionType } from '@/types/script';
import type { SlideListItem } from '@/types/slide';

// 기존 공용 타입 재사용

export interface ChartDataPoint {
  label: string;
  value: number;
  tooltipTitle: string;
  sessionCount: number;
  originalTime?: number;
}

export type InsightTopSlide = {
  slideId: string;
  slide?: SlideListItem;
  slideIndex: number;
  title: string;
  commentCount: number;
  feedbackCount: number;
};

export type InsightModel = {
  projectIdStr: string;
  projectIdNum: number;
  latestVideoId: string | null;

  hasVideo: boolean;

  summaryStats: SummaryStat[];

  dropOffSlides: DropOffSlide[];
  dropOffTimes: DropOffTime[];

  retentionTitle: string;
  retentionData: ChartDataPoint[];
  retentionIsVideo: boolean;

  topSlides: InsightTopSlide[];
  topSlideReactionSummaries?: Array<Record<ReactionType, number>>;
  getThumb: (slideIndex: number) => string | undefined;
  getSeekSecondsForSlide: (slideIndex: number) => number | null;
  getSlideIdByIndex: (slideIndex: number) => string | null;

  recentCommentsData: ReadRecentCommentListResponseDto | undefined;

  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
};
