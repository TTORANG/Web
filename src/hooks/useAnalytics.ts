import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api';
import {
  type RecordExitRequest,
  getProjectVideos,
  getSlideAnalytics,
  getVideoExitAnalytics,
  recordExit,
} from '@/api/endpoints/analytics';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore } from '@/stores/authStore';

export function useRecordExit() {
  return useMutation({
    mutationFn: (data: RecordExitRequest) => recordExit(data),
  });
}

export function useProjectVideos(projectId: string) {
  return useQuery({
    queryKey: queryKeys.videos.list(projectId),
    queryFn: () => getProjectVideos(projectId),
    enabled: !!projectId,
  });
}

export function useSlideAnalytics(projectId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.slides(projectId),
    queryFn: () => getSlideAnalytics(projectId),
    enabled: !!projectId,
  });
}

export function useVideoExitAnalytics(videoId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.videoExits(videoId),
    queryFn: () => getVideoExitAnalytics(videoId),
    enabled: !!videoId,
  });
}

export function recordExitOnUnload(data: RecordExitRequest) {
  try {
    const baseURL = apiClient.defaults.baseURL ?? '';
    const url = baseURL ? new URL('/analytics/exit', baseURL).toString() : '/analytics/exit';
    const { accessToken } = useAuthStore.getState();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

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
