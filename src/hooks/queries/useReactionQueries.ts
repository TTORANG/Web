/**
 * @file useReactionQueries.ts
 * @description 리액션(이모지) 관련 TanStack Query 훅
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ToggleReactionRequest, toggleReaction } from '@/api/endpoints/reactions';
import { queryKeys } from '@/api/queryClient';

export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: ToggleReactionRequest }) =>
      toggleReaction(slideId, data),

    onSuccess: (_, { slideId }) => {
      // 해당 슬라이드 캐시 무효화 -> 최신 리액션 정보 반영
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}
