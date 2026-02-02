/**
 * 공유 링크 관련 TanStack Query 훅
 *
 * @file useShares.ts
 * @description 공유 가능 영상 조회 및 공유 링크 생성 훅
 */
import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import { createShareLink, getShareableVideos } from '@/api/endpoints/shares';
import type { CreateShareLinkRequest } from '@/types/share';

/**
 * 공유 가능 영상 목록 조회 훅
 *
 * @param projectId - 프로젝트 ID
 * @param options - 추가 옵션 (enabled 등)
 */
export function useShareableVideos(projectId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.shares.videos(projectId ?? ''),
    queryFn: () => getShareableVideos(projectId!),
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
