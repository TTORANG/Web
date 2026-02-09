import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ToggleSlideReactionDto } from '@/api';
import { getSlideReactionSummary, toggleReaction } from '@/api/endpoints/reactions';
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
 * 슬라이드 리액션 토글 Mutation 훅
 *
 * 성공 시 해당 슬라이드의 리액션 집계 캐시를 무효화합니다.
 */
export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: ToggleSlideReactionDto }) =>
      toggleReaction(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reactions.summary(slideId) });
    },
  });
}
