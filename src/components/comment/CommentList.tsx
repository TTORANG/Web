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
}

export default function CommentList({ comments, onAddReply, onGoToSlideRef }: Props) {
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
        <div key={comment.id}>
          {/* 부모 댓글 */}
          <CommentItem
            comment={comment}
            theme="dark"
            isActive={replyingToId === comment.id}
            replyText={replyDraft}
            onReplyTextChange={setReplyDraft}
            onToggleReply={() => handleToggleReply(comment.id)}
            onSubmitReply={() => handleReplySubmit(comment.id)}
            onCancelReply={handleCancelReply}
            onGoToSlideRef={onGoToSlideRef}
          />

          {/* 대댓글 */}
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              theme="dark"
              isActive={replyingToId === reply.id}
              replyText={replyDraft}
              onReplyTextChange={setReplyDraft}
              onToggleReply={() => handleToggleReply(reply.id)}
              onSubmitReply={() => handleReplySubmit(reply.id)}
              onCancelReply={handleCancelReply}
              isIndented
            />
          ))}
        </div>
      ))}
    </div>
  );
}
