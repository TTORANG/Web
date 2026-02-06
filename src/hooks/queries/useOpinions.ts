/**
 * 의견 관련 TanStack Query 훅
 * @deprecated 이 파일은 사용되지 않습니다. useComments.ts 사용 권장
 *
 * 실제 API 엔드포인트가 존재하지 않아 동작하지 않음
 * 대신 사용: src/hooks/useComments.ts
 */

/* ⚠️ LEGACY CODE - 사용되지 않음

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateComment } from '@/api/endpoints/comments';
import { type CreateOpinionRequest, createOpinion, deleteOpinion } from '@/api/endpoints/opinions';
import type { CreateOpinionDto } from '@/api';
import { createSlideComment, deleteComment } from '@/api/endpoints/comments.ts';
import { queryKeys } from '@/api/queryClient';

/** 의견 추가 *\/
export function useCreateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: CreateOpinionDto }) =>
      createSlideComment(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

/** 의견 삭제 *\/
export function useDeleteOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId }: { opinionId: string; slideId: string }) => deleteComment(opinionId),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

/** 의견 수정 *\/
export function useUpdateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opinionId,
      data,
    }: {
      opinionId: string;
      data: { content: string };
      slideId: string;
    }) => updateComment(opinionId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

*/
