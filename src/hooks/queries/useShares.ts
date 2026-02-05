/**
 * 공유 링크 관련 TanStack Query 훅
 *
 * @file useShares.ts
 * @description 공유 가능 영상 조회 및 공유 링크 생성 훅
 */
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import { createShareLink, getShareableVideos } from '@/api/endpoints/shares';
import type { CreateShareLinkRequest } from '@/types/share';

/**
 * 공유 가능 영상 목록 조회 훅 (무한 스크롤)
 *
 * @param projectId - 프로젝트 ID
 * @param options - 추가 옵션 (enabled 등)
 */
export function useShareableVideos(projectId: string | undefined, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: queryKeys.shares.videos(projectId ?? ''),
    queryFn: ({ pageParam = 1 }) => getShareableVideos(projectId!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.resultType === 'SUCCESS' && lastPage.success?.pagination.hasNext) {
        return lastPage.success.pagination.currentPage + 1;
      }
      return undefined;
    },
    enabled: !!projectId && (options?.enabled ?? true),
  });
}

/**
 * 공유 링크 생성 Mutation 훅
 */
export function useCreateShareLink() {
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateShareLinkRequest }) =>
      createShareLink(projectId, data),
  });
}
