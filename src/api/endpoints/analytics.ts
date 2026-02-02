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
  return response.data.success;
}
