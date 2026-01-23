/**
 * @file CommentList.tsx
 * @description 피드백 화면 우측 댓글 리스트
 *
 * 댓글 리스트 렌더링과 답글 입력 상태를 관리합니다.
 * 공통 Comment 컴포넌트를 사용합니다.
 */
import { useState } from 'react';

import type { CommentRef, Comment as CommentType } from '@/types/comment';

import Comment from './Comment';

interface CommentListProps {
  comments: CommentType[];
  onAddReply: (targetId: string, content: string) => void;
  onGoToRef: (ref: CommentRef) => void;
  onDeleteComment?: (commentId: string) => void;
}

export default function CommentList({
  comments,
  onAddReply,
  onGoToRef,
  onDeleteComment,
}: CommentListProps) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  const handleReplySubmit = (targetId: string) => {
    if (replyDraft.trim()) {
      onAddReply(targetId, replyDraft);
    }
    setReplyDraft('');
    setReplyingToId(null);
  };

  const handleToggleReply = (targetId: string) => {
    setReplyingToId(replyingToId === targetId ? null : targetId);
    setReplyDraft('');
  };

  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyDraft('');
  };

  return (
    <div className="mt-2 flex-1 space-y-2 overflow-y-auto">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          isActive={replyingToId === comment.id}
          replyText={replyDraft}
          onReplyTextChange={setReplyDraft}
          onToggleReply={() => handleToggleReply(comment.id)}
          onSubmitReply={() => handleReplySubmit(comment.id)}
          onDelete={() => onDeleteComment?.(comment.id)}
          onDeleteComment={onDeleteComment}
          onCancelReply={handleCancelReply}
          onGoToRef={onGoToRef}
          replyingToId={replyingToId}
          setReplyingToId={setReplyingToId}
          onReplySubmit={handleReplySubmit}
          onToggleReplyById={handleToggleReply}
        />
      ))}
    </div>
  );
}
