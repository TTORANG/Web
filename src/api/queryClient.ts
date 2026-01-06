/**
 * @file queryClient.ts
 * @description TanStack Query 클라이언트 설정
 *
 * TanStack Query (구 react-query)는 서버 상태 관리 라이브러리입니다.
 * 직접 fetch/axios 호출하는 것보다 좋은 점:
 * - 자동 캐싱 (같은 데이터 다시 안 불러옴)
 * - 로딩/에러 상태 자동 관리
 * - 백그라운드 리패치 (탭 전환 시 자동 갱신)
 * - 낙관적 업데이트 (UI 먼저 변경, 서버는 나중에)
 *
 * 이 파일에서는 전역 에러 핸들링 및 하이브리드 전략을 적용합니다.
 */
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { type ApiError } from '@/api/client';
import { handleApiError } from '@/api/errorHandler';

/**
 * React Query 전역 에러 핸들링 함수
 * Axios에서 처리하지 않은 비즈니스 에러만 잡아서 처리합니다.
 */
const handleGlobalError = (error: unknown) => {
  if (isAxiosError<ApiError>(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // Axios 인터셉터에서 이미 처리한 시스템 에러(401, 500 등)는 무시 (중복 토스트 방지)
    if (status === 401 || (status && status >= 500)) {
      return;
    }

    // 비즈니스 에러 (400, 403, 404 등) 처리
    handleApiError(status, message);
  } else if (error instanceof Error) {
    handleApiError(undefined, error.message);
  } else {
    handleApiError(undefined, '알 수 없는 오류가 발생했습니다.');
  }
};

/**
 * Query Key 팩토리
 *
 * 쿼리 키를 일관되게 관리합니다.
 * 캐시 무효화할 때 유용합니다.
 */
export const queryKeys = {
  // 슬라이드 관련 쿼리 키
  slides: {
    all: ['slides'] as const,
    lists: () => [...queryKeys.slides.all, 'list'] as const,
    list: (projectId: string) => [...queryKeys.slides.lists(), projectId] as const,
    details: () => [...queryKeys.slides.all, 'detail'] as const,
    detail: (slideId: string) => [...queryKeys.slides.details(), slideId] as const,
  },

  // 프로젝트 관련 쿼리 키
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
 *
 * 앱 전체에서 하나만 사용합니다.
 * 캐시와 설정을 관리합니다.
 */
export const queryClient = new QueryClient({
  // 1. 쿼리 (GET) 전역 에러 핸들링
  queryCache: new QueryCache({
    onError: (error) => handleGlobalError(error),
  }),

  // 2. 뮤테이션 (POST, PUT, DELETE) 전역 에러 핸들링
  mutationCache: new MutationCache({
    onError: (error) => handleGlobalError(error),
  }),

  defaultOptions: {
    queries: {
      // 5분간 캐시 유지 (같은 쿼리 다시 호출해도 캐시 사용)
      staleTime: 1000 * 60 * 5,

      // 캐시 30분 후 삭제
      gcTime: 1000 * 60 * 30,

      // 실패 시 1회만 재시도 (기본값 3은 너무 많음)
      retry: 1,

      // 윈도우 포커스 시 자동 리패치 (프로덕션에서는 활성화)
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      // mutation(POST, PUT, DELETE) 실패 시 재시도 안 함
      retry: false,
    },
  },
});
