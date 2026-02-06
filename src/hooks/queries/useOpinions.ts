/**
 * 의견(댓글) 관련 TanStack Query 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateOpinionDto } from '@/api';
import {
  createReply,
  createSlideComment,
  deleteComment,
  getReplies,
  getSlideComments,
  updateComment,
} from '@/api/endpoints/comments.ts';
import { queryKeys } from '@/api/queryClient';

/** 슬라이드 댓글 목록 조회 */
export function useSlideComments(slideId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.comments.list(slideId),
    queryFn: () => getSlideComments(slideId, page, limit),
    enabled: !!slideId,
  });
}

/** 댓글의 답글 목록 조회 */
export function useReplies(commentId: string) {
  return useQuery({
    queryKey: queryKeys.comments.replies(commentId),
    queryFn: () => getReplies(commentId),
    enabled: !!commentId,
  });
}

/** 의견 추가 */
export function useCreateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: CreateOpinionDto }) =>
      createSlideComment(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

/** 답글 작성 */
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: { content: string } }) =>
      createReply(commentId, data),

    onSuccess: (_, { commentId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.replies(commentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });
    },
  });
}

/** 댓글 수정 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: { content: string } }) =>
      updateComment(commentId, data),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}

/** 의견 삭제 */
export function useDeleteOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId }: { opinionId: string; slideId: string }) => deleteComment(opinionId),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}
