/**
 * @file Comment.tsx
 * @description 댓글 항목 공통 컴포넌트
 *
 * 슬라이드 화면(CommentPopover)과 피드백 화면(CommentList) 모두에서 사용됩니다.
 * data-theme 속성에 따라 CSS 변수가 자동 반전되어 다크모드를 지원합니다.
 */
import React, { useCallback } from 'react';

import clsx from 'clsx';

import FileIcon from '@/assets/icons/icon-document.svg?react';
import RemoveIcon from '@/assets/icons/icon-remove.svg?react';
import ReplyIcon from '@/assets/icons/icon-reply.svg?react';
import { MOCK_USERS } from '@/mocks/users';
import type { Comment as CommentType } from '@/types/comment';
import { formatRelativeTime } from '@/utils/format';

import CommentInput from './CommentInput';

interface CommentProps {
  /** 댓글 데이터 */
  comment: CommentType;
  /** 답글 입력창 활성화 여부 */
  isActive: boolean;
  /** 답글 입력값 */
  replyText: string;
  /** 답글 입력값 변경 핸들러 */
  onReplyTextChange: (text: string) => void;
  /** 답글 버튼 토글 핸들러 */
  onToggleReply: () => void;
  /** 답글 제출 핸들러 */
  onSubmitReply: () => void;
  /** 답글 취소 핸들러 */
  onCancelReply: () => void;
  /** 댓글 삭제 핸들러 */
  onDelete?: () => void;
  /** ID로 댓글 삭제 (재귀 렌더링용) */
  onDeleteComment?: (id: string) => void;
  /** 슬라이드 참조 클릭 핸들러 */
  onGoToSlideRef?: (ref: string) => void;
  /** 답글 들여쓰기 여부 */
  isIndented?: boolean;
  /** 현재 답글 작성 중인 댓글 ID (재귀용) */
  replyingToId?: string | null;
  /** 답글 작성 대상 설정 (재귀용) */
  setReplyingToId?: (id: string | null) => void;
  /** ID로 답글 제출 (재귀용) */
  onReplySubmit?: (targetId: string) => void;
  /** ID로 답글 토글 (재귀용) */
  onToggleReplyById?: (targetId: string) => void;
}

/**
 * 댓글 항목 컴포넌트
 *
 * 댓글 내용, 작성자 정보, 답글 버튼, 삭제 버튼을 표시합니다.
 * 대댓글은 재귀적으로 렌더링됩니다.
 */
function Comment({
  comment,
  isActive,
  replyText,
  onReplyTextChange,
  onToggleReply,
  onSubmitReply,
  onCancelReply,
  onDelete,
  onDeleteComment,
  onGoToSlideRef,
  isIndented = false,
  replyingToId,
  setReplyingToId,
  onReplySubmit,
  onToggleReplyById,
}: CommentProps) {
  const user = MOCK_USERS.find((u) => u.id === comment.authorId);
  const authorName = user?.name ?? '알 수 없음';
  const authorProfileImage = user?.profileImage;

  const handleChildToggle = useCallback(
    (id: string) => {
      onToggleReplyById?.(id);
    },
    [onToggleReplyById],
  );

  const handleChildSubmit = useCallback(
    (id: string) => {
      onReplySubmit?.(id);
    },
    [onReplySubmit],
  );

  const handleChildDelete = useCallback(
    (id: string) => {
      onDeleteComment?.(id);
    },
    [onDeleteComment],
  );

  const handleGoToSlideRef = useCallback(() => {
    if (comment.slideRef && onGoToSlideRef) {
      onGoToSlideRef(comment.slideRef);
    }
  }, [comment.slideRef, onGoToSlideRef]);

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

              {comment.isMine && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="댓글 삭제"
                  className="flex items-center gap-1 rounded text-caption-bold text-error active:opacity-80 focus-visible:outline-2 focus-visible:outline-error"
                >
                  삭제
                  <RemoveIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="text-body-s text-black">
              {comment.slideRef && onGoToSlideRef && (
                <button
                  type="button"
                  onClick={handleGoToSlideRef}
                  className="text-body-s-bold text-main-variant1 hover:underline mr-1 inline-flex items-center align-middle rounded focus-visible:outline-2 focus-visible:outline-main"
                >
                  <FileIcon className="text-main-variant1" />
                  &nbsp;{comment.slideRef}
                </button>
              )}
              <span className="align-middle">{comment.content}</span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={onToggleReply}
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
          value={replyText}
          onChange={onReplyTextChange}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
          autoFocus
          className="pb-4 pr-4 pl-15 bg-gray-200"
          textareaClassName="text-body-s text-black"
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              isActive={replyingToId === reply.id}
              onToggleReply={() => handleChildToggle(reply.id)}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onSubmitReply={() => handleChildSubmit(reply.id)}
              onCancelReply={onCancelReply}
              onDelete={() => handleChildDelete(reply.id)}
              onDeleteComment={onDeleteComment}
              onGoToSlideRef={onGoToSlideRef}
              onReplySubmit={onReplySubmit}
              onToggleReplyById={onToggleReplyById}
              isIndented={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(Comment);
