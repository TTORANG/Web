/**
 * @file useComments.ts
 * @description 댓글/의견 관련 통합 훅
 *
 * SlidePage(Opinion)와 FeedbackSlidePage(CommentList) 모두에서 사용됩니다.
 * Optimistic UI 패턴으로 로컬 store 업데이트 후 API 호출합니다.
 */
import { useMemo } from 'react';

import { useSlideStore } from '@/stores/slideStore';
import type { CommentItem } from '@/types/comment';
import { flatToTree } from '@/utils/comment';
import { showToast } from '@/utils/toast';

import { useCreateOpinion, useDeleteOpinion } from './queries/useOpinions';

const EMPTY_COMMENTS: CommentItem[] = [];

export function useComments() {
  const slideId = useSlideStore((state) => state.slide?.id);
  const flatComments = useSlideStore((state) => state.slide?.opinions);
  const addOpinionStore = useSlideStore((state) => state.addOpinion);
  const addReplyStore = useSlideStore((state) => state.addReply);
  const deleteOpinionStore = useSlideStore((state) => state.deleteOpinion);
  const setOpinions = useSlideStore((state) => state.setOpinions);

  const { mutate: createOpinionApi } = useCreateOpinion();
  const { mutate: deleteOpinionApi } = useDeleteOpinion();

  // FeedbackSlidePage의 CommentList에서 사용 (tree 구조)
  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    return flatToTree(flatComments);
  }, [flatComments]);

  /**
   * 새 댓글 추가 (Optimistic UI)
   */
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

  /**
   * 답글 추가 (Optimistic UI)
   */
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

  /**
   * 댓글 삭제 (Optimistic UI)
   */
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
