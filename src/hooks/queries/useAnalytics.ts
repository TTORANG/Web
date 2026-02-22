import { useMutation, useQuery } from '@tanstack/react-query';

import {
  type RecordExitRequest,
  getPresentationAnalyticsSummary,
  getRecentComments,
  getSlideAnalytics,
  getSlideRetention,
  getVideoAnalytics,
  getVideoRetention,
  recordExit,
} from '@/api/endpoints/analytics';
import { queryKeys } from '@/api/queryClient';

type QueryHookOptions = {
  enabled?: boolean;
};

/**
 * 이탈 기록 Mutation 훅
 *
 * 페이지 이탈 시 분석 데이터를 서버에 전송합니다.
 */
export function useRecordExit() {
  return useMutation({
    mutationFn: (data: RecordExitRequest) => recordExit(data),
  });
}

/**
 * 슬라이드별 분석 데이터 조회
 *
 * @param projectId - 프로젝트 ID
 */
export function useSlideAnalytics(projectId: number, options?: QueryHookOptions) {
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.analytics.slides(projectId),
    queryFn: () => getSlideAnalytics(projectId),
    enabled: !!projectId && isEnabled,
  });
}

/**
 * 영상 타임라인 분석 데이터 조회
 *
 * @param videoId - 영상 ID
 */
export function useVideoAnalytics(videoId: number, options?: QueryHookOptions) {
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.analytics.videoExits(videoId),
    queryFn: () => getVideoAnalytics(videoId),
    enabled: !!videoId && isEnabled,
  });
}

/**
 * 프로젝트 요약 분석 조회 (상단 카드 4개 + videoIds)
 *
 * @param projectId - 프로젝트 ID
 */
export function usePresentationAnalyticsSummary(projectId: number, options?: QueryHookOptions) {
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.analytics.summary(projectId),
    queryFn: () => getPresentationAnalyticsSummary(projectId),
    enabled: !!projectId && isEnabled,
  });
}

/**
 * 슬라이드별 청중 잔존률 조회
 *
 * @param projectId - 프로젝트 ID
 */
export function useSlideRetention(projectId: number, options?: QueryHookOptions) {
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.analytics.slideRetention(projectId),
    queryFn: () => getSlideRetention(projectId),
    enabled: !!projectId && isEnabled,
  });
}

/**
 * 영상별 시청 잔존률 조회
 *
 * @param videoId - 영상 ID
 */
export function useVideoRetention(videoId: number, options?: QueryHookOptions) {
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.analytics.videoRetention(videoId),
    queryFn: () => getVideoRetention(videoId),
    enabled: !!videoId && isEnabled,
  });
}

/**
 * 최근 댓글 피드백 조회
 *
 * @param projectId - 프로젝트 ID
 */
export function useRecentComments(projectId: number, options?: QueryHookOptions) {
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.analytics.comments(projectId),
    queryFn: () => getRecentComments(projectId),
    enabled: !!projectId && isEnabled,
  });
}
