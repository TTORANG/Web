/**
 * @file useOpinions.ts
 * @description 의견 관련 TanStack Query 훅
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type CreateOpinionRequest, createOpinion, deleteOpinion } from '@/api/endpoints/opinions';
import { queryKeys } from '@/api/queryClient';

/**
 * 의견 추가 훅
 *
 * @example
 * const { mutate: addOpinion, isPending } = useCreateOpinion();
 *
 * const handleSubmit = () => {
 *   addOpinion(
 *     { slideId: '1', data: { content: '좋은 의견이에요!' } },
 *     { onSuccess: () => console.log('추가 완료') }
 *   );
 * };
 */
export function useCreateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: CreateOpinionRequest }) =>
      createOpinion(slideId, data),

    onSuccess: (_, { slideId }) => {
      // 해당 슬라이드 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

/**
 * 의견 삭제 훅
 *
 * @example
 * const { mutate: removeOpinion, isPending } = useDeleteOpinion();
 *
 * const handleDelete = () => {
 *   removeOpinion(
 *     { opinionId: 'op-1', slideId: '1' },
 *     { onSuccess: () => console.log('삭제 완료') }
 *   );
 * };
 */
export function useDeleteOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId }: { opinionId: string; slideId: string }) => deleteOpinion(opinionId),

    onSuccess: (_, { slideId }) => {
      // 해당 슬라이드 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}
