/**
 * @file CommentContext.tsx
 * @description 댓글 상태 공유를 위한 Context
 *
 * CommentList에서 Provider로 감싸고, Comment에서 useCommentContext로 사용합니다.
 * 답글 입력 상태와 핸들러들을 공유하여 props drilling을 방지합니다.
 */
import { createContext, useContext } from 'react';

import type { Comment } from '@/types/comment';

type CommentRef = NonNullable<Comment['ref']>;

interface CommentContextValue {
  /** 현재 답글 작성 중인 댓글 ID */
  replyingToId: string | null;
  /** 답글 입력값 */
  replyDraft: string;
  /** 답글 입력값 변경 */
  setReplyDraft: (text: string) => void;
  /** 답글 입력창 토글 */
  toggleReply: (id: string) => void;
  /** 답글 제출 */
  submitReply: (targetId: string) => void;
  /** 답글 취소 */
  cancelReply: () => void;
  /** 댓글 삭제 */
  deleteComment?: (id: string) => void;
  /** 참조로 이동 (슬라이드/영상) */
  goToRef: (ref: CommentRef) => void;
}

const CommentContext = createContext<CommentContextValue | null>(null);

export function CommentProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: CommentContextValue;
}) {
  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
}

export function useCommentContext() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useCommentContext must be used within a CommentProvider');
  }
  return context;
}
