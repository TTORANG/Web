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

export async function getSummaryAnalytics(projectId: string): Promise<SummaryAnalytics> {
  const response = await apiClient.get<ApiResponse<SummaryAnalytics>>(
    `/presentations/${projectId}/analytics/summary`,
  );

  if (response.data.resultType === 'FAILURE') {
    throw new Error(response.data.error.reason);
  }

  // success가 없으면 에러 처리 (옵셔널 체이닝 문제 방지)
  if (!response.data.success) {
    throw new Error('데이터가 존재하지 않습니다.');
  }

  return response.data.success;
}
