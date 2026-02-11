import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateSlideReactionDto } from '@/api';
import { createReaction, getSlideReactionSummary } from '@/api/endpoints/reactions';
import { queryKeys } from '@/api/queryClient';

/**
 * 여러 슬라이드의 리액션 집계 조회
 *
 * @param slideIds - 조회할 슬라이드 ID 배열
 */
export function useSlideReactionSummaries(slideIds: string[]) {
  return useQuery({
    queryKey: queryKeys.reactions.summary(slideIds.join('|')),
    queryFn: () => Promise.all(slideIds.map((slideId) => getSlideReactionSummary(slideId))),
    enabled: slideIds.length > 0,
  });
}

/**
 * 단일 슬라이드 리액션 집계 조회
 *
 * @param slideId - 조회할 슬라이드 ID
 */
export function useSlideReactionSummary(slideId?: string) {
  return useQuery({
    queryKey: queryKeys.reactions.summary(slideId ?? ''),
    queryFn: () => {
      if (!slideId) {
        return Promise.resolve(null);
      }
      return getSlideReactionSummary(slideId);
    },
    enabled: !!slideId,
  });
}

/**
 * 슬라이드 리액션 생성 Mutation 훅
 *
 * 요청 1회 = 카운트 1 증가 (토글 아님)
 * 성공 시 해당 슬라이드의 리액션 집계 캐시를 무효화합니다.
 */
export function useCreateReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: CreateSlideReactionDto }) =>
      createReaction(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reactions.summary(slideId) });
    },
  });
}
