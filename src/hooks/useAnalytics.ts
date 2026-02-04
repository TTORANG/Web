import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api';
import {
  type RecordExitRequest,
  getProjectAnalyticsSummary,
  getSlideAnalytics,
  getVideoAnalytics,
  recordExit,
} from '@/api/endpoints/analytics';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore } from '@/stores/authStore';

/**
 * 이탈 기록 (mutation)
 */
export function useRecordExit() {
  return useMutation({
    mutationFn: (data: RecordExitRequest) => recordExit(data),
  });
}

/**
 * 슬라이드별 분석
 */
export function useSlideAnalytics(projectId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.slides(projectId),
    queryFn: () => getSlideAnalytics(projectId),
    enabled: !!projectId,
  });
}

/**
 * 영상 타임라인 분석(= video analytics)
 * - 기존 useVideoExitAnalytics / getVideoExitAnalytics 대신
 */
export function useVideoAnalytics(videoId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.videoExits(videoId),
    queryFn: () => getVideoAnalytics(videoId),
    enabled: !!videoId,
  });
}

/**
 * 프로젝트 요약 분석 (상단 카드 4개 + videoIds)
 * - 기존 useSummaryAnalytics / getSummaryAnalytics 대신
 */
export function useProjectAnalyticsSummary(projectId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(projectId),
    queryFn: () => getProjectAnalyticsSummary(projectId),
    enabled: !!projectId,
  });
}

/**
 * unload 시 이탈 기록 (fetch keepalive)
 */
export function recordExitOnUnload(data: RecordExitRequest) {
  try {
    const baseURL = apiClient.defaults.baseURL ?? '';
    const url = baseURL ? new URL('analytics/exit', baseURL).toString() : '/analytics/exit';
    const { accessToken } = useAuthStore.getState();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      keepalive: true,
    });
  } catch {
    return undefined;
  }
}
