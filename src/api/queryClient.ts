/**
 * @file queryClient.ts
 * @description TanStack Query 클라이언트 설정 및 전역 에러 핸들링
 *
 * 에러 처리 흐름 (하이브리드 전략):
 * - 401, 500+: Axios 인터셉터에서 즉시 처리 → 여기서 무시
 * - 400, 403, 404: Axios 인터셉터 통과 → 여기서 처리
 */
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { type ApiFailureResponse } from '@/api/client';
import { handleApiError } from '@/api/errorHandler';

/**
 * 캐시 관련 상수
 */
export const CACHE_STALE_TIME_MS = 1000 * 60 * 5; // 5분
export const CACHE_GC_TIME_MS = 1000 * 60 * 30; // 30분
export const MAX_RETRIES = 1; // 실패 시 재시도 횟수

/**
 * React Query 전역 에러 핸들링 함수
 * Axios에서 처리하지 않은 비즈니스 에러만 잡아서 처리합니다.
 */
const handleGlobalError = (error: unknown, meta?: { suppressErrorToast?: boolean }) => {
  // 0. mutation meta에서 suppressErrorToast가 true면 무시 (연타 시 토스트 방지)
  if (meta?.suppressErrorToast) {
    return;
  }

  // 1. Axios 에러인 경우
  if (isAxiosError<ApiFailureResponse>(error)) {
    // 이미 Axios 인터셉터에서 처리된 에러라면 무시 (중복 토스트 방지)
    if (error.isHandled) {
      return;
    }

    const status = error.response?.status;
    const reason = error.response?.data?.error?.reason || error.message;

    handleApiError(status, reason);
    return;
  }

  // 2. 일반 Error 객체인 경우
  if (error instanceof Error) {
    handleApiError(undefined, error.message);
    return;
  }

  // 3. 그 외 알 수 없는 에러
  handleApiError(undefined, '알 수 없는 오류가 발생했습니다.');
};

/**
 * Query Key 팩토리
 * 쿼리 키를 일관되게 관리하며, 캐시 무효화 시 유용합니다.
 */
export const queryKeys = {
  slides: {
    all: ['slides'] as const,
    lists: () => [...queryKeys.slides.all, 'list'] as const,
    list: (projectId: string) => [...queryKeys.slides.lists(), projectId] as const,
    details: () => [...queryKeys.slides.all, 'detail'] as const,
    detail: (slideId: string) => [...queryKeys.slides.details(), slideId] as const,
  },
  scripts: {
    all: ['scripts'] as const,
    detail: (slideId: string) => [...queryKeys.scripts.all, 'detail', slideId] as const,
    versions: (slideId: string) => [...queryKeys.scripts.all, 'versions', slideId] as const,
  },
  presentations: {
    all: ['presentations'] as const,
    lists: () => [...queryKeys.presentations.all, 'list'] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      maxDuration?: number;
      sort?: string;
    }) => [...queryKeys.presentations.lists(), params ?? {}] as const,
    details: () => [...queryKeys.presentations.all, 'detail'] as const,
    detail: (projectId: string) => [...queryKeys.presentations.details(), projectId] as const,
  },
  videos: {
    all: ['videos'] as const,
    lists: () => [...queryKeys.videos.all, 'list'] as const,
    list: (projectId: string) => [...queryKeys.videos.lists(), projectId] as const,
    details: () => [...queryKeys.videos.all, 'detail'] as const,
    detail: (videoId: string) => [...queryKeys.videos.details(), videoId] as const,
  },
  shares: {
    all: ['shares'] as const,
    videos: (projectId: string) => [...queryKeys.shares.all, 'videos', projectId] as const,
    content: (shareToken: string, sessionId?: string) =>
      [...queryKeys.shares.all, 'content', shareToken, sessionId ?? 'anonymous'] as const,
    comments: (shareToken: string, sessionId?: string) =>
      [...queryKeys.shares.all, 'comments', shareToken, sessionId ?? ''] as const,
  },
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    list: (slideId: string) => [...queryKeys.comments.lists(), slideId] as const,
    replies: (commentId: string) => [...queryKeys.comments.all, 'replies', commentId] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    slides: (projectId: number) => [...queryKeys.analytics.all, 'slides', projectId] as const,
    videoExits: (videoId: number) => [...queryKeys.analytics.all, 'videoExits', videoId] as const,
    summary: (projectId: number) => [...queryKeys.analytics.all, 'summary', projectId] as const,
    slideRetention: (projectId: number) =>
      [...queryKeys.analytics.all, 'slideRetention', projectId] as const,
    videoRetention: (videoId: number) =>
      [...queryKeys.analytics.all, 'videoRetention', videoId] as const,
    comments: (projectId: number) => [...queryKeys.analytics.all, 'comments', projectId] as const,
  },
  reactions: {
    all: ['reactions'] as const,
    summaries: () => [...queryKeys.reactions.all, 'summary'] as const,
    summary: (slideId: string) => [...queryKeys.reactions.summaries(), slideId] as const,
    totals: () => [...queryKeys.reactions.all, 'total'] as const,
    total: (projectId: string) => [...queryKeys.reactions.totals(), projectId] as const,
    video: {
      all: (videoId: string) => [...queryKeys.reactions.all, 'video', videoId] as const,
      window: (videoId: string, timestampMs: number, windowMs = 2000) =>
        [...queryKeys.reactions.video.all(videoId), 'window', timestampMs, windowMs] as const,
      timeline: (videoId: string, intervalMs = 5000) =>
        [...queryKeys.reactions.video.all(videoId), 'timeline', intervalMs] as const,
      buckets: (videoId: string, intervalMs = 5000) =>
        [...queryKeys.reactions.video.all(videoId), 'buckets', intervalMs] as const,
    },
  },
} as const;

/**
 * QueryClient 인스턴스
 * 앱 전체의 캐시와 설정을 관리합니다.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) =>
      handleGlobalError(error, query.meta as { suppressErrorToast?: boolean }),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) =>
      handleGlobalError(error, mutation.meta as { suppressErrorToast?: boolean }),
  }),
  defaultOptions: {
    queries: {
      staleTime: CACHE_STALE_TIME_MS,
      gcTime: CACHE_GC_TIME_MS,
      retry: MAX_RETRIES,
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      retry: false,
    },
  },
});
