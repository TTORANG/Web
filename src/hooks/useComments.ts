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

import { updateComment as updateCommentApi } from '@/api/endpoints/comments';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import { findRootParentId, flatToTree } from '@/utils/comment';
import { showToast } from '@/utils/toast';

import { useCreateOpinion, useCreateReply, useDeleteOpinion } from './queries/useOpinions';

const EMPTY_COMMENTS: Comment[] = [];

export function useComments() {
  const slideId = useSlideStore((state) => state.slide?.slideId);
  const flatComments = useSlideStore((state) => state.slide?.opinions);
  const addOpinionStore = useSlideStore((state) => state.addOpinion);
  const addReplyStore = useSlideStore((state) => state.addReply);
  const deleteOpinionStore = useSlideStore((state) => state.deleteOpinion);
  const updateOpinionStore = useSlideStore((state) => state.updateOpinion);
  const setOpinions = useSlideStore((state) => state.setOpinions);

  const { mutate: createOpinionApi } = useCreateOpinion();
  const { mutate: createReplyApi } = useCreateReply();
  const { mutate: deleteOpinionApi } = useDeleteOpinion();

  const findOpinion = (opinionId: string) => flatComments?.find((c) => c.id === opinionId);

  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    const tree = flatToTree(flatComments);
    return [...tree].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [flatComments]);

  const addComment = (content: string, currentSlideIndex: number) => {
    if (!slideId) return;

    const previousOpinions = flatComments ?? [];
    addOpinionStore(content, currentSlideIndex);

    createOpinionApi(
      { slideId, data: { content } },
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
    const target = findOpinion(parentId);
    const targetServerId = target?.serverId ?? parentId;
    const rootParentId = findRootParentId(flatComments ?? [], parentId) ?? parentId;

    const previousOpinions = flatComments ?? [];
    // 최상위 부모에게 답글 달기 (로컬 저장)
    addReplyStore(rootParentId, content);

    createReplyApi(
      { commentId: targetServerId, data: { content } },
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

    deleteOpinionApi(
      { opinionId: targetServerId, slideId: targetSlideId },
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

    updateCommentApi(targetServerId, { content })
      .then(() => {
        // 성공 시 자동으로 쿼리 무효화됨
      })
      .catch(() => {
        setOpinions(previousOpinions);
        showToast.error('댓글 수정에 실패했습니다.', '잠시 후 다시 시도해주세요.');
      });
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
    updateComment,
  };
}
