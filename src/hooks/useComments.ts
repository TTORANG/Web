/**
 * 댓글 통합 훅
 *
 * TanStack Query(API 호출) + Zustand(Optimistic UI)를 결합합니다.
 * 로컬 store 즉시 업데이트 후 서버 API를 호출하고, 실패 시 롤백합니다.
 */
import { useMemo } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateCommentDto } from '@/api';
import {
  createReply,
  createSlideComment,
  deleteComment as deleteCommentApi,
  getReplies,
  getSlideComments,
  updateComment,
} from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import { flatToTree } from '@/utils/comment';
import { showToast } from '@/utils/toast';

// ── TanStack Query 훅 ──────────────────────────────────────

/** 슬라이드 댓글 목록 조회 */
export function useSlideCommentsQuery(slideId: string, page = 1, limit = 20) {
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

/** 댓글 작성 (mutation) */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: CreateCommentDto }) =>
      createSlideComment(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

/** 답글 작성 (mutation) */
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: { content: string } }) =>
      createReply(commentId, data),

    onSuccess: (_, { commentId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.replies(commentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}

/** 댓글 수정 (mutation) */
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

/** 댓글 삭제 (mutation) */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; slideId: string }) =>
      deleteCommentApi(commentId),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

// ── Optimistic UI 훅 ───────────────────────────────────────

const EMPTY_COMMENTS: Comment[] = [];

export function useComments() {
  const slideId = useSlideStore((state) => state.slide?.slideId);
  const flatComments = useSlideStore((state) => state.slide?.comments);
  const addCommentStore = useSlideStore((state) => state.addComment);
  const addReplyStore = useSlideStore((state) => state.addReply);
  const deleteCommentStore = useSlideStore((state) => state.deleteComment);
  const setComments = useSlideStore((state) => state.setComments);

  const { mutate: createCommentMutate } = useCreateComment();
  const { mutate: createReplyMutate } = useCreateReply();
  const { mutate: deleteCommentMutate } = useDeleteComment();

  const findComment = (commentId: string) => flatComments?.find((c) => c.id === commentId);

  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    const tree = flatToTree(flatComments);
    return [...tree].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [flatComments]);

  const addComment = (content: string, currentSlideIndex: number) => {
    if (!slideId) return;

    const previousComments = flatComments ?? [];
    addCommentStore(content, currentSlideIndex);

    createCommentMutate(
      { slideId, data: { content } },
      {
        onError: () => {
          setComments(previousComments);
          showToast.error('댓글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const addReply = (parentId: string, content: string) => {
    const target = findComment(parentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId ?? parentId;
    if (!targetSlideId) return;

    const previousComments = flatComments ?? [];
    addReplyStore(parentId, content);

    createReplyMutate(
      { commentId: targetServerId, data: { content } },
      {
        onError: () => {
          setComments(previousComments);
          showToast.error('답글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const deleteComment = (commentId: string) => {
    const target = findComment(commentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId ?? commentId;
    if (!targetSlideId) return;

    const previousComments = flatComments ?? [];
    deleteCommentStore(commentId);

    deleteCommentMutate(
      { commentId: targetServerId, slideId: targetSlideId },
      {
        onError: () => {
          setComments(previousComments);
          showToast.error('댓글 삭제에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
  };
}
