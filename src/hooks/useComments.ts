/**
 * 댓글 통합 훅
 *
 * Optimistic UI 패턴으로 로컬 store 업데이트 후 API를 호출합니다.
 *
 * @returns comments - 트리 구조의 댓글 목록
 * @returns addComment - 새 댓글 추가
 * @returns addReply - 답글 추가
 * @returns deleteComment - 댓글 삭제
 */
import { useMemo } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createReply,
  createSlideComment,
  deleteComment as deleteCommentApi,
  updateComment as updateCommentApi,
} from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import { findRootParentId, flatToTree } from '@/utils/comment';
import { showToast } from '@/utils/toast';

const EMPTY_COMMENTS: Comment[] = [];

export function useComments() {
  const queryClient = useQueryClient();
  const slideId = useSlideStore((state) => state.slide?.slideId);
  const flatComments = useSlideStore((state) => state.slide?.opinions);
  const addOpinionStore = useSlideStore((state) => state.addOpinion);
  const addReplyStore = useSlideStore((state) => state.addReply);
  const deleteOpinionStore = useSlideStore((state) => state.deleteOpinion);
  const updateOpinionStore = useSlideStore((state) => state.updateOpinion);
  const setOpinions = useSlideStore((state) => state.setOpinions);

  // 최상위 댓글 작성 mutation
  const { mutate: createCommentMutation } = useMutation({
    mutationFn: ({ slideId, content }: { slideId: string; content: string }) =>
      createSlideComment(slideId, { content }),
    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
    },
  });

  // 답글 작성 mutation (항상 최상위 부모에게)
  const { mutate: createReplyMutation } = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      createReply(commentId, { content }),
    onSuccess: () => {
      if (slideId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
      }
    },
  });

  // 댓글 수정 mutation
  const { mutate: updateCommentMutation } = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateCommentApi(commentId, { content }),
    onSuccess: () => {
      if (slideId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
      }
    },
  });

  // 댓글 삭제 mutation
  const { mutate: deleteCommentMutation } = useMutation({
    mutationFn: ({ commentId }: { commentId: string }) => deleteCommentApi(commentId),
    onSuccess: () => {
      if (slideId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
      }
    },
  });

  const findOpinion = (opinionId: string) => flatComments?.find((c) => c.id === opinionId);

  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    const tree = flatToTree(flatComments);
    return [...tree].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [flatComments]);

  const addComment = (content: string, currentSlideIndex: number) => {
    if (!slideId) return;

    const previousOpinions = flatComments ?? [];
    addOpinionStore(content, currentSlideIndex);

    createCommentMutation(
      { slideId, content },
      {
        onSuccess: () => {
          // 서버가 웹소켓을 보내지 않으므로 수동으로 쿼리 무효화
          // TODO: 서버에서 broadcastNewComment 호출 후 제거
        },
        onError: () => {
          setOpinions(previousOpinions);
          showToast.error('댓글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const addReply = (parentId: string, content: string) => {
    // 대댓글의 답글을 클릭하면 최상위 부모에게 답글 달기
    const rootParentId = findRootParentId(flatComments ?? [], parentId);
    const target = findOpinion(rootParentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId;

    if (!targetSlideId) {
      showToast.error('답글 등록에 실패했습니다.', '슬라이드 정보를 찾을 수 없습니다.');
      return;
    }

    // serverId가 없으면 id를 서버 ID로 사용 (서버에서 직접 로드된 댓글인 경우)
    const resolvedServerId = targetServerId ?? target?.id;

    // 서버에 저장되지 않은 최상위 댓글에는 답글을 달 수 없음
    if (!resolvedServerId) {
      showToast.error('답글 등록에 실패했습니다.', '부모 댓글이 저장될 때까지 기다려주세요.');
      return;
    }

    const previousOpinions = flatComments ?? [];
    // 최상위 부모에게 답글 달기 (로컬 저장)
    addReplyStore(rootParentId, content);

    // API 요청: 항상 최상위 부모의 serverId를 commentId로 사용
    createReplyMutation(
      { commentId: resolvedServerId, content },
      {
        onError: () => {
          setOpinions(previousOpinions);
          showToast.error('답글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const deleteComment = (commentId: string) => {
    const target = findOpinion(commentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId;

    if (!targetSlideId) {
      showToast.error('댓글 삭제에 실패했습니다.', '슬라이드 정보를 찾을 수 없습니다.');
      return;
    }

    // 서버에 저장되지 않은 댓글은 로컬에서만 삭제
    if (!targetServerId) {
      deleteOpinionStore(commentId);
      return;
    }

    const previousOpinions = flatComments ?? [];
    deleteOpinionStore(commentId);

    deleteCommentMutation(
      { commentId: targetServerId },
      {
        onError: () => {
          setOpinions(previousOpinions);
          showToast.error('댓글 삭제에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const updateComment = (commentId: string, content: string) => {
    const target = findOpinion(commentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId;

    if (!targetSlideId) {
      showToast.error('댓글 수정에 실패했습니다.', '슬라이드 정보를 찾을 수 없습니다.');
      return;
    }

    // 서버에 저장되지 않은 댓글은 로컬에서만 수정
    if (!targetServerId) {
      updateOpinionStore(commentId, content);
      return;
    }

    const previousOpinions = flatComments ?? [];
    updateOpinionStore(commentId, content);

    updateCommentMutation(
      { commentId: targetServerId, content },
      {
        onError: () => {
          setOpinions(previousOpinions);
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
