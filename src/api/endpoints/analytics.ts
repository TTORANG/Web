/**
 * @file analytics.ts
 * @description Insight analytics API
 */
import { apiClient } from '@/api';
import type { ApiResponse } from '@/types/api';

function unwrapApiResponse<T>(response: ApiResponse<T>, defaultMessage: string): T {
  if (response.resultType === 'FAILURE') {
    const reason = response.reason;
    let errorMessage = defaultMessage;

    if (typeof reason === 'string') {
      errorMessage = reason;
    } else if (reason && typeof reason === 'object') {
      errorMessage = reason.message || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (!response.success) {
    throw new Error('데이터가 존재하지 않습니다.');
  }

  return response.success;
}

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

  return unwrapApiResponse(response.data, '슬라이드별 분석 조회에 실패했습니다.');
}

export async function getSummaryAnalytics(projectId: string): Promise<SummaryAnalytics> {
  const response = await apiClient.get<ApiResponse<SummaryAnalytics>>(
    `/presentations/${projectId}/analytics/summary`,
  );

  return unwrapApiResponse(response.data, '분석 요약 조회에 실패했습니다.');
}
