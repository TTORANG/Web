import { useMemo } from 'react';

import { useSlideStore } from '@/stores/slideStore';
// utils 확인
import type { CommentItem } from '@/types/comment';
// 경로 확인
import { flatToTree } from '@/utils/comment';

const EMPTY_COMMENTS: CommentItem[] = [];

export function useComments() {
  const flatComments = useSlideStore((state) => state.slide?.opinions);
  const addOpinionStore = useSlideStore((state) => state.addOpinion);
  const addReplyStore = useSlideStore((state) => state.addReply);
  const deleteOpinionStore = useSlideStore((state) => state.deleteOpinion);

  const comments = useMemo(() => {
    // flatComments가 없으면(null/undefined) 고정된 빈 배열 반환
    if (!flatComments) return EMPTY_COMMENTS;

    // Flat 데이터를 Tree 구조로 변환
    return flatToTree(flatComments);
  }, [flatComments]);

  // UI 인터페이스 연결 (Wrapper 함수들)
  const addComment = (content: string, currentSlideIndex: number) => {
    addOpinionStore(content, currentSlideIndex);
  };

  const addReply = (targetId: string, content: string) => {
    addReplyStore(targetId, content);
  };

  const deleteComment = (targetId: string) => {
    deleteOpinionStore(targetId);
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
  };
}
