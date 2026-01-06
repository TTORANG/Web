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

import { type ApiError } from '@/api/client';
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
const handleGlobalError = (error: unknown) => {
  // 1. Axios 에러인 경우
  if (isAxiosError<ApiError>(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // [하이브리드 전략]
    // Axios 인터셉터에서 이미 처리한 시스템 에러(401, 500 등)는 무시 (중복 토스트 방지)
    if (status === 401 || (status && status >= 500)) {
      return;
    }

    handleApiError(status, message);
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
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: () => [...queryKeys.projects.lists()] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (projectId: string) => [...queryKeys.projects.details(), projectId] as const,
  },
} as const;

/**
 * QueryClient 인스턴스
 * 앱 전체의 캐시와 설정을 관리합니다.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleGlobalError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleGlobalError(error),
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
