/**
 * @file Comment.tsx
 * @description 댓글 항목 공통 컴포넌트
 *
 * 슬라이드 화면(CommentPopover)과 피드백 화면(CommentList) 모두에서 사용됩니다.
 * data-theme 속성에 따라 CSS 변수가 자동 반전되어 다크모드를 지원합니다.
 * CommentContext를 통해 상태를 공유받습니다.
 */
import React, { useCallback } from 'react';

import clsx from 'clsx';

import FileIcon from '@/assets/icons/icon-document.svg?react';
import RemoveIcon from '@/assets/icons/icon-remove.svg?react';
import ReplyIcon from '@/assets/icons/icon-reply.svg?react';
import { MOCK_USERS } from '@/mocks/users';
import type { Comment as CommentType } from '@/types/comment';
import { formatRelativeTime, formatVideoTimestamp } from '@/utils/format';

import { useCommentContext } from './CommentContext';
import CommentInput from './CommentInput';

interface CommentProps {
  /** 댓글 데이터 */
  comment: CommentType;
  /** 답글 들여쓰기 여부 */
  isIndented?: boolean;
}

/**
 * 댓글 항목 컴포넌트
 *
 * 댓글 내용, 작성자 정보, 답글 버튼, 삭제 버튼을 표시합니다.
 * 대댓글은 재귀적으로 렌더링됩니다.
 */
function Comment({ comment, isIndented = false }: CommentProps) {
  const {
    replyingToId,
    replyDraft,
    setReplyDraft,
    toggleReply,
    submitReply,
    cancelReply,
    deleteComment,
    goToRef,
  } = useCommentContext();

  const user = MOCK_USERS.find((u) => u.id === comment.authorId);
  const authorName = user?.name ?? '알 수 없음';
  const authorProfileImage = user?.profileImage;

  const isActive = replyingToId === comment.id;

  const handleToggleReply = useCallback(() => {
    toggleReply(comment.id);
  }, [toggleReply, comment.id]);

  const handleSubmitReply = useCallback(() => {
    submitReply(comment.id);
  }, [submitReply, comment.id]);

  const handleDelete = useCallback(() => {
    deleteComment?.(comment.id);
  }, [deleteComment, comment.id]);

  const handleGoToRef = useCallback(() => {
    if (comment.ref) {
      goToRef(comment.ref);
    }
  }, [comment.ref, goToRef]);

  // ref에서 표시할 라벨 생성
  const refLabel = comment.ref
    ? comment.ref.kind === 'slide'
      ? `슬라이드 ${comment.ref.index + 1}`
      : formatVideoTimestamp(comment.ref.seconds)
    : null;

  return (
    <div>
      <div
        className={clsx(
          'flex gap-3 py-3 pr-4 transition-colors',
          isIndented ? 'pl-15' : 'pl-4',
          isActive ? 'bg-gray-200' : 'bg-gray-100',
        )}
      >
        <div className="w-8 shrink-0">
          {authorProfileImage ? (
            <img
              src={authorProfileImage}
              alt={authorName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-400" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 pt-1.5 min-w-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="max-w-50 truncate text-body-s-bold text-black">{authorName}</span>
                <span className="text-caption text-gray-600">
                  {formatRelativeTime(comment.timestamp)}
                </span>
              </div>

              {comment.isMine && deleteComment && (
                <button
                  type="button"
                  onClick={handleDelete}
                  aria-label="댓글 삭제"
                  className="flex items-center gap-1 rounded text-caption-bold text-error active:opacity-80 focus-visible:outline-2 focus-visible:outline-error"
                >
                  삭제
                  <RemoveIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="text-body-s text-black">
              {comment.ref && (
                <button
                  type="button"
                  onClick={handleGoToRef}
                  className={clsx(
                    'mr-2 inline-flex items-center align-middle rounded text-body-s-bold hover:underline focus-visible:outline-2 focus-visible:outline-main',
                    comment.ref.kind === 'slide' ? 'text-main-variant1' : 'text-main',
                  )}
                  aria-label={
                    comment.ref.kind === 'slide' ? `${refLabel}로 이동` : `영상 ${refLabel}로 이동`
                  }
                >
                  {comment.ref.kind === 'slide' && (
                    <FileIcon className="text-main-variant1" aria-hidden="true" />
                  )}
                  {comment.ref.kind === 'slide' ? <>&nbsp;</> : null}
                  {refLabel}
                </button>
              )}

              <span className="align-middle">{comment.content}</span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handleToggleReply}
              aria-expanded={isActive}
              aria-label={`${authorName}에게 답글 달기`}
              className={clsx(
                'flex items-center gap-1 rounded text-caption-bold transition focus-visible:outline-2 focus-visible:outline-main',
                isActive
                  ? 'text-gray-400'
                  : 'text-main hover:text-main-variant1 active:text-main-variant2',
              )}
            >
              답글
              <ReplyIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {isActive && (
        <CommentInput
          value={replyDraft}
          onChange={setReplyDraft}
          onSubmit={handleSubmitReply}
          onCancel={cancelReply}
          autoFocus
          className="pb-4 pr-4 pl-15 bg-gray-200"
          textareaClassName="text-body-s text-black"
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(Comment);
