import { useMutation, useQuery } from '@tanstack/react-query';

import {
  type RecordExitRequest,
  getProjectAnalyticsSummary,
  getSlideAnalytics,
  getSlideRetention,
  getVideoAnalytics,
  getVideoRetention,
  recordExit,
} from '@/api/endpoints/analytics';
import { queryKeys } from '@/api/queryClient';

/**
 * 이탈 기록 (mutation) unload 시 이탈 기록 (fetch keepalive)
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
export function useVideoAnalytics(videoId: number) {
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
 * 슬라이드별 청중 잔존률
 */
export function useSlideRetention(projectId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.slideRetention(projectId),
    queryFn: () => getSlideRetention(projectId),
    enabled: !!projectId,
  });
}

/**
 * 영상별 시청 잔존률
 */
export function useVideoRetention(videoId: number) {
  return useQuery({
    queryKey: queryKeys.analytics.videoRetention(videoId),
    queryFn: () => getVideoRetention(videoId),
    enabled: !!videoId, // 🧷hasVideo 일때만 enabled하게 처리해야하나?
  });
}
