// hooks/useComments.ts
import { useState } from 'react';

import { INITIAL_COMMENTS } from '@/constants/feedback';
import type { CommentItem } from '@/types/comment';
import { addReplyToTree, createComment } from '@/utils/comment';

// ✅ [추가] 재귀적으로 댓글을 찾아 삭제하는 헬퍼 함수
const removeCommentFromTree = (comments: CommentItem[], targetId: string): CommentItem[] => {
  // 1. 현재 레벨에서 targetId와 일치하는 댓글 제거 (filter)
  const filteredComments = comments.filter((c) => c.id !== targetId);

  // 2. 남은 댓글들의 하위(replies)에서도 동일하게 재귀 수행 (map)
  return filteredComments.map((c) => ({
    ...c,
    replies: c.replies ? removeCommentFromTree(c.replies, targetId) : [],
  }));
};

export function useComments() {
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);

  const addComment = (content: string, currentSlideIndex: number) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const newComment = createComment({
      content: trimmed,
      author: '익명',
      slideRef: `슬라이드 ${currentSlideIndex + 1}`,
    });

    setComments((prev) => [newComment, ...prev]);
  };

  const addReply = (targetId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setComments((prev) =>
      addReplyToTree(prev, targetId, {
        content: trimmed,
        author: '익명',
      }),
    );
  };

  // ✅ [추가] 삭제 함수 구현
  const deleteComment = (targetId: string) => {
    // 필요하다면 여기서 confirm 창을 띄우거나 API 호출을 할 수 있습니다.
    // if (!window.confirm('정말 삭제하시겠습니까?')) return;

    setComments((prev) => removeCommentFromTree(prev, targetId));
  };

  // ✅ [수정] deleteComment를 반환 객체에 포함
  return { comments, addComment, addReply, deleteComment };
}
