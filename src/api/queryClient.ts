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
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient 인스턴스
 *
 * 앱 전체에서 하나만 사용합니다.
 * 캐시와 설정을 관리합니다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 캐시 유지 (같은 쿼리 다시 호출해도 캐시 사용)
      staleTime: 1000 * 60 * 5,

      // 캐시 30분 후 삭제
      gcTime: 1000 * 60 * 30,

      // 실패 시 3번까지 재시도
      retry: 3,

      // 윈도우 포커스 시 자동 리패치 (탭 전환 후 돌아왔을 때)
      refetchOnWindowFocus: true,
    },
    mutations: {
      // mutation(POST, PUT, DELETE) 실패 시 재시도 안 함
      retry: false,
    },
  },
});

/**
 * Query Key 팩토리
 *
 * 쿼리 키를 일관되게 관리합니다.
 * 캐시 무효화할 때 유용합니다.
 *
 * @example
 * // 모든 슬라이드 쿼리 무효화
 * queryClient.invalidateQueries({ queryKey: queryKeys.slides.all });
 *
 * // 특정 슬라이드만 무효화
 * queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail('1') });
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
