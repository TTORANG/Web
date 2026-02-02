/**
 * @file analytics.ts
 * @description Insight analytics API
 */
import { apiClient } from '@/api';
import type { ApiResponse } from '@/types/api';

export interface SummaryAnalytics {
  totalViews: number;
  avgDurationSeconds: number;
  completionRate: number;
  totalFeedbackCount: number;
}

export interface SlideAnalytics {
  slideId: string;
  slideNum: number;
  title: string;
  viewCount: number;
  exitCount: number;
  exitRate: number;
  reactionCount: number;
  commentCount: number;
  feedbackCount: number;
}

export interface SlideAnalyticsResponse {
  slides: SlideAnalytics[];
}

export async function getSlideAnalytics(projectId: string): Promise<SlideAnalyticsResponse> {
  const response = await apiClient.get<ApiResponse<SlideAnalyticsResponse>>(
    `/presentations/${projectId}/analytics/slides`,
  );

  if (response.data.resultType === 'FAILURE') {
    const reason = response.data.reason;
    let errorMessage = '슬라이드별 분석 조회에 실패했습니다.';

    if (typeof reason === 'string') {
      errorMessage = reason;
    } else if (reason && typeof reason === 'object') {
      errorMessage = reason.message || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (!response.data.success) {
    throw new Error('데이터가 존재하지 않습니다.');
  }

  return response.data.success;
}

export async function getSummaryAnalytics(projectId: string): Promise<SummaryAnalytics> {
  const response = await apiClient.get<ApiResponse<SummaryAnalytics>>(
    `/presentations/${projectId}/analytics/summary`,
  );

  if (response.data.resultType === 'FAILURE') {
    // 1. reason이 객체인지 문자열인지 확인해서 처리
    const reason = response.data.reason;
    let errorMessage = '분석 요약 조회에 실패했습니다.';

    if (typeof reason === 'string') {
      errorMessage = reason; // 문자열이면 그대로 사용
    } else if (reason && typeof reason === 'object') {
      errorMessage = reason.message || errorMessage; // 객체면 .message 추출
    }

    // 2. 이제 errorMessage는 무조건 string이므로 에러가 사라집니다.
    throw new Error(errorMessage);
  }

  // success가 없으면 에러 처리 (옵셔널 체이닝 문제 방지)
  if (!response.data.success) {
    throw new Error('데이터가 존재하지 않습니다.');
  }

  return response.data.success;
}
