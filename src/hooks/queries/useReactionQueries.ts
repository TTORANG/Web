/**
 * 리액션 관련 TanStack Query 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ToggleSlideReactionDto } from '@/api';
import { getSlideReactionSummary, toggleReaction } from '@/api/endpoints/reactions';
import { queryKeys } from '@/api/queryClient';

/** 슬라이드 리액션 집계 조회 */
export function useSlideReactionSummary(slideId: string) {
  return useQuery({
    queryKey: queryKeys.reactions.summary(slideId),
    queryFn: () => getSlideReactionSummary(slideId),
    enabled: !!slideId,
  });
}

/** 리액션 토글 */
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
