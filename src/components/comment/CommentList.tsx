/**
 * @file CommentList.tsx
 * @description 피드백 화면 우측 댓글 리스트
 *
 * 댓글 리스트 렌더링과 답글 입력 상태를 관리합니다.
 * 공통 CommentItem 컴포넌트를 사용합니다.
 */
import { useState } from 'react';

import type { CommentItem as CommentItemType } from '@/types/comment';

import CommentItem from './CommentItem';

interface Props {
  comments: CommentItemType[];
  onAddReply: (targetId: string, content: string) => void;
  onGoToSlideRef: (ref: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export default function CommentList({
  comments,
  onAddReply,
  onGoToSlideRef,
  onDeleteComment,
}: Props) {
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
    <div className="mr-35 mt-2 flex-1 space-y-2 overflow-y-auto">
      {comments.map((comment) => (
        <CommentItem
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
          onGoToSlideRef={onGoToSlideRef}
          // 재귀에 필요한 props 전달
          replyingToId={replyingToId}
          setReplyingToId={setReplyingToId}
          onReplySubmit={handleReplySubmit}
          onToggleReplyById={handleToggleReply}
        />
      ))}
    </div>
  );
}
