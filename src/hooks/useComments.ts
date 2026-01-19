/**
 * 댓글/의견 통합 훅
 *
 * Optimistic UI 패턴으로 로컬 store 업데이트 후 API를 호출합니다.
 *
 * @returns comments - 트리 구조의 댓글 목록
 * @returns addComment - 새 댓글 추가
 * @returns addReply - 답글 추가
 * @returns deleteComment - 댓글 삭제
 */
import { useMemo } from 'react';

import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import { flatToTree } from '@/utils/comment';
import { showToast } from '@/utils/toast';

import { useCreateOpinion, useDeleteOpinion } from './queries/useOpinions';

const EMPTY_COMMENTS: Comment[] = [];

export function useComments() {
  const slideId = useSlideStore((state) => state.slide?.id);
  const flatComments = useSlideStore((state) => state.slide?.opinions);
  const addOpinionStore = useSlideStore((state) => state.addOpinion);
  const addReplyStore = useSlideStore((state) => state.addReply);
  const deleteOpinionStore = useSlideStore((state) => state.deleteOpinion);
  const setOpinions = useSlideStore((state) => state.setOpinions);

  const { mutate: createOpinionApi } = useCreateOpinion();
  const { mutate: deleteOpinionApi } = useDeleteOpinion();

  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    return flatToTree(flatComments);
  }, [flatComments]);

  const addComment = (content: string, currentSlideIndex: number) => {
    if (!slideId) return;

    const previousOpinions = flatComments ?? [];
    addOpinionStore(content, currentSlideIndex);

    createOpinionApi(
      { slideId, data: { content } },
      {
        onError: () => {
          setOpinions(previousOpinions);
          showToast.error('댓글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const addReply = (parentId: string, content: string) => {
    if (!slideId) return;

    const previousOpinions = flatComments ?? [];
    addReplyStore(parentId, content);

    createOpinionApi(
      { slideId, data: { content, parentId } },
      {
        onError: () => {
          setOpinions(previousOpinions);
          showToast.error('답글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const deleteComment = (commentId: string) => {
    if (!slideId) return;

    const previousOpinions = flatComments ?? [];
    deleteOpinionStore(commentId);

    deleteOpinionApi(
      { opinionId: commentId, slideId },
      {
        onError: () => {
          setOpinions(previousOpinions);
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
