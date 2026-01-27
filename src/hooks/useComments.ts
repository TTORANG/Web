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
    const target = findOpinion(parentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId ?? parentId;
    if (!targetSlideId) return;

    const previousOpinions = flatComments ?? [];
    addReplyStore(parentId, content);

    createOpinionApi(
      { slideId: targetSlideId, data: { content, parentId: targetServerId } },
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
    const targetServerId = target?.serverId ?? commentId;
    if (!targetSlideId) return;

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

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
  };
}
