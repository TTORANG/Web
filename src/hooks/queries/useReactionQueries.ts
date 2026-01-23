/**
 * 리액션 관련 TanStack Query 훅
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ToggleReactionRequest, toggleReaction } from '@/api/endpoints/reactions';
import { queryKeys } from '@/api/queryClient';

/** 리액션 토글 */
export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: ToggleReactionRequest }) =>
      toggleReaction(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}
