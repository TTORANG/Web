import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import { createShareLink, getShareableVideos, getSharedContent } from '@/api/endpoints/shares';
import { useAuthStore } from '@/stores/authStore';
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

/**
 * 공유 토큰으로 공유 콘텐츠 조회
 *
 * @param shareToken - 공유 토큰
 */
export function useSharedContent(shareToken: string | undefined) {
  const sessionId = useAuthStore((s) => s.user?.sessionId);

  return useQuery({
    queryKey: queryKeys.shares.content(shareToken ?? ''),
    queryFn: () => getSharedContent(shareToken!, sessionId),
    enabled: !!shareToken,
  });
}
