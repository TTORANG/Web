/** */
import React, { useCallback } from 'react';

import clsx from 'clsx';

import ReplyIcon from '@/assets/icons/icon-reply.svg?react';
import { UserAvatar } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import type { Comment as CommentType } from '@/types/comment';
import { formatRelativeTime, formatVideoTimestamp } from '@/utils/format';

import { useCommentContext } from './CommentContext';
import CommentInput from './CommentInput';
import CommentReplies from './CommentReplies';

interface CommentProps {
  comment: CommentType;
  isIndented?: boolean;
  rootCommentId?: string;
}

function Comment({ comment, isIndented = false, rootCommentId }: CommentProps) {
  // 💡 핵심: 부모로부터 전달받은 rootId가 있으면 그것을 사용, 없으면 자신이 최상위 부모임
  const resolvedRootId = rootCommentId ?? comment.commentId;

  const {
    replyingToId,
    replyDraft,
    setReplyDraft,
    toggleReply,
    submitReply,
    cancelReply,
    deleteComment,
    startEdit,
    goToRef,
  } = useCommentContext();

  const isActive = replyingToId === comment.commentId;
  const authorName = comment.userName ?? '알 수 없음';

  // 💡 [0:00] 중복 텍스트 제거 로직
  const cleanContent = (content: string) => content.replace(/\[\d{1,2}:\d{2}\]\s*/g, '');

  const handleSubmitReply = useCallback(() => {
    // 💡 답글 제출 시 항상 최상위 부모 ID(resolvedRootId)를 타겟으로 전송
    submitReply(resolvedRootId);
  }, [submitReply, resolvedRootId]);

  return (
    <div id={`comment-${comment.commentId}`}>
      <div
        className={clsx(
          'flex gap-3 py-3 pr-4 transition-colors',
          isIndented
            ? 'pl-15 bg-gray-50/50 border-l-2 border-gray-100'
            : 'pl-4 border-b border-gray-100',
          isActive ? 'bg-gray-200' : 'bg-white',
        )}
      >
        <div className="w-8 shrink-0">
          <UserAvatar src={comment.userProfileImage} alt={authorName} size={32} />
        </div>

        <div className="flex-1 min-w-0 pt-1.5 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-black">{authorName}</span>
            <span className="text-[11px] text-gray-600">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <div className="text-sm text-black leading-snug">
            {comment.ref?.kind === 'video' && !comment.isReply && (
              <button
                onClick={() => goToRef(comment.ref!)}
                className="mr-1 text-main font-bold hover:underline"
              >
                {formatVideoTimestamp(comment.ref.seconds)}
              </button>
            )}
            <span className="align-middle">{cleanContent(comment.content)}</span>
          </div>

          <button
            type="button"
            onClick={() => toggleReply(comment.commentId)}
            className="mt-1 flex items-center gap-1 text-[11px] font-bold text-main"
          >
            답글 <ReplyIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isActive && (
        <CommentInput
          value={replyDraft}
          onChange={setReplyDraft}
          onSubmit={handleSubmitReply}
          onCancel={cancelReply}
          autoFocus
          className="pb-4 pr-4 pl-15 bg-gray-50/50"
        />
      )}

      {/* 💡 답글 컴포넌트에 최상위 ID를 상속하여 대댓글의 답글도 Root를 바라보게 함 */}
      {!isIndented && (
        <CommentReplies
          serverId={comment.serverId}
          localReplies={comment.replies ?? []}
          rootCommentId={resolvedRootId}
        />
      )}
    </div>
  );
}

export default React.memo(Comment);
