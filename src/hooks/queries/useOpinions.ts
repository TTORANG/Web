/**
 * 의견 관련 TanStack Query 훅
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type CreateOpinionRequest, createOpinion, deleteOpinion } from '@/api/endpoints/opinions';
import { queryKeys } from '@/api/queryClient';

/** 의견 추가 */
export function useCreateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: CreateOpinionRequest }) =>
      createOpinion(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

/** 의견 삭제 */
export function useDeleteOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId }: { opinionId: string; slideId: string }) => deleteOpinion(opinionId),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}
