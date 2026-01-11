// hooks/useComments.ts
import { useState } from 'react';

import { INITIAL_COMMENTS } from '@/constants/feedback';
import type { CommentItem } from '@/types/comment';
import { addReplyToTree, createComment } from '@/utils/comment';

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

  return { comments, addComment, addReply };
}
