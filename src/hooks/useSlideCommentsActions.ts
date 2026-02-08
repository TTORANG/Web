import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateCommentRequestDto } from '@/api';
import {
  createReply,
  createSlideComment,
  deleteComment as deleteCommentApi,
  updateComment as updateCommentApi,
} from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import { flatToTree } from '@/utils/comment';
import { showToast } from '@/utils/toast';

// ── 내부 전용 TanStack Query 훅 ─────────────────────────────

function useCreateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      slideId: string;
      projectId: string;
      data: CreateCommentRequestDto;
    }) => createSlideComment(variables.slideId, variables.data),

    onSuccess: (_, { slideId, projectId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.list(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

function useCreateReplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      commentId: string;
      slideId: string;
      projectId: string;
      data: { content: string };
    }) => createReply(variables.commentId, variables.data),

    onSuccess: (_, { commentId, slideId, projectId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.replies(commentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.list(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

function useUpdateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      commentId: string;
      slideId: string;
      projectId: string;
      data: { content: string };
    }) => updateCommentApi(variables.commentId, variables.data),

    onSuccess: (_, { slideId, projectId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.list(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { commentId: string; slideId: string; projectId: string }) =>
      deleteCommentApi({ commentId: variables.commentId }),

    onSuccess: (_, { slideId, projectId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.list(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });
}

// ── Optimistic UI 훅 ───────────────────────────────────────

const EMPTY_COMMENTS: Comment[] = [];

/**
 * 슬라이드 댓글 통합 훅
 *
 * TanStack Query(API 호출) + Zustand(Optimistic UI)를 결합합니다.
 * 로컬 store 즉시 업데이트 후 서버 API를 호출하고, 실패 시 롤백합니다.
 *
 * @returns comments - 트리 구조 댓글 목록 (최신순 정렬)
 * @returns addComment - 댓글 추가 (optimistic)
 * @returns addReply - 답글 추가 (optimistic)
 * @returns deleteComment - 댓글 삭제 (optimistic)
 * @returns updateComment - 댓글 수정 (optimistic)
 */
export function useSlideCommentsActions() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const slideId = useSlideStore((state) => state.slide?.slideId);
  const flatComments = useSlideStore((state) => state.slide?.comments);
  const addCommentStore = useSlideStore((state) => state.addComment);
  const addReplyStore = useSlideStore((state) => state.addReply);
  const deleteCommentStore = useSlideStore((state) => state.deleteComment);
  const updateCommentStore = useSlideStore((state) => state.updateComment);
  const setComments = useSlideStore((state) => state.setComments);

  const { mutate: createCommentMutate } = useCreateCommentMutation();
  const { mutate: createReplyMutate } = useCreateReplyMutation();
  const { mutate: deleteCommentMutate } = useDeleteCommentMutation();
  const { mutate: updateCommentMutate } = useUpdateCommentMutation();

  const findComment = (commentId: string) => flatComments?.find((c) => c.commentId === commentId);

  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    return flatToTree(flatComments);
  }, [flatComments]);

  const addComment = (content: string, currentSlideIndex: number) => {
    if (!slideId) return;

    const previousComments = flatComments ?? [];
    addCommentStore(content, currentSlideIndex);

    createCommentMutate(
      { slideId, projectId, data: { content } },
      {
        onSuccess: () => {
          // 서버가 웹소켓을 보내지 않으므로 수동으로 쿼리 무효화
          // TODO: 서버에서 broadcastNewComment 호출 후 제거
        },
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

    // 최상위 부모에게 답글 달기 (slideStore의 addReply가 rootParentId를 찾음)
    const previousComments = flatComments ?? [];
    addReplyStore(parentId, content);

    createReplyMutate(
      { commentId: targetServerId, slideId: targetSlideId, projectId, data: { content } },
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
    const targetServerId = target?.serverId;

    if (!targetSlideId) {
      showToast.error('댓글 삭제에 실패했습니다.', '슬라이드 정보를 찾을 수 없습니다.');
      return;
    }

    // 서버에 저장되지 않은 댓글은 로컬에서만 삭제
    if (!targetServerId) {
      deleteCommentStore(commentId);
      return;
    }

    const previousComments = flatComments ?? [];
    deleteCommentStore(commentId);

    deleteCommentMutate(
      { commentId: targetServerId, slideId: targetSlideId, projectId },
      {
        onError: () => {
          setComments(previousComments);
          showToast.error('댓글 삭제에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const updateComment = (commentId: string, content: string) => {
    const target = findComment(commentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId;

    if (!targetSlideId) {
      showToast.error('댓글 수정에 실패했습니다.', '슬라이드 정보를 찾을 수 없습니다.');
      return;
    }

    // 서버에 저장되지 않은 댓글은 로컬에서만 수정
    if (!targetServerId) {
      updateCommentStore(commentId, content);
      return;
    }

    const previousComments = flatComments ?? [];
    updateCommentStore(commentId, content);

    updateCommentMutate(
      { commentId: targetServerId, slideId: targetSlideId, projectId, data: { content } },
      {
        onError: () => {
          setComments(previousComments);
          showToast.error('댓글 수정에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
    updateComment,
  };
}
