// hooks/useComments.ts
import { useRef, useState } from 'react';

import { INITIAL_COMMENTS } from '../constants/feedback';
import type { Comment } from '../types/feedback';

export function useComments() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const nextIdRef = useRef(1000);

  const genId = () => {
    nextIdRef.current += 1;
    return nextIdRef.current;
  };

  const addComment = (content: string, currentSlideIndex: number) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const newComment: Comment = {
      id: genId(),
      user: '익명',
      time: '방금 전',
      slideRef: `슬라이드 ${currentSlideIndex + 1}`,
      content: trimmed,
      replies: [],
    };

    setComments((prev) => [newComment, ...prev]);
  };

  const addReply = (targetId: number, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const newReply: Comment = {
      id: genId(),
      user: '익명',
      time: '방금 전',
      content: trimmed,
      replies: [],
    };

    const addToTree = (list: Comment[]): Comment[] => {
      return list.map((node) => {
        if (node.id === targetId) {
          return {
            ...node,
            replies: [...(node.replies ?? []), newReply],
          };
        }
        if (node.replies && node.replies.length > 0) {
          return {
            ...node,
            replies: addToTree(node.replies),
          };
        }
        return node;
      });
    };

    setComments((prev) => addToTree(prev));
  };

  return { comments, addComment, addReply };
}
