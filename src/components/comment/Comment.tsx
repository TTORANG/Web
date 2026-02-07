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
import ModifyIcon from '@/assets/icons/icon-modify.svg?react';
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
  /** 최상위 부모 댓글 ID (답글의 답글에서도 항상 root로 요청하기 위함) */
  rootCommentId?: string;
}

/**
 * 댓글 항목 컴포넌트
 *
 * 댓글 내용, 작성자 정보, 답글 버튼, 삭제 버튼을 표시합니다.
 * 대댓글은 재귀적으로 렌더링됩니다.
 */
function Comment({ comment, isIndented = false, rootCommentId }: CommentProps) {
  // rootCommentId가 없으면 자기 자신이 최상위 댓글
  const resolvedRootId = rootCommentId ?? comment.id;
  const {
    replyingToId,
    replyDraft,
    setReplyDraft,
    toggleReply,
    submitReply,
    cancelReply,
    editingId,
    editDraft,
    setEditDraft,
    toggleEdit,
    submitEdit,
    cancelEdit,
    deleteComment,
    goToRef,
  } = useCommentContext();

  const user = MOCK_USERS.find((u) => u.id === comment.userId);
  const authorName = user?.name ?? '알 수 없음';
  const authorProfileImage = user?.profileImage;

  const isActive = replyingToId === comment.id || editingId === comment.id;
  const isEditing = editingId === comment.id;

  const handleToggleReply = useCallback(() => {
    toggleReply(comment.id);
  }, [toggleReply, comment.id]);

  const handleSubmitReply = useCallback(() => {
    // 항상 최상위 부모 댓글 ID로 답글 제출 (서버는 root에만 답글 허용)
    submitReply(resolvedRootId);
  }, [submitReply, resolvedRootId]);

  const handleDelete = useCallback(() => {
    deleteComment?.(comment.id);
  }, [deleteComment, comment.id]);

  const handleToggleEdit = useCallback(() => {
    toggleEdit(comment.id, comment.content);
  }, [toggleEdit, comment.id, comment.content]);

  const handleSubmitEdit = useCallback(() => {
    submitEdit(comment.id);
  }, [submitEdit, comment.id]);

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
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>

              {comment.isMine && deleteComment && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleEdit}
                    aria-label="댓글 수정"
                    className="flex items-center gap-1 rounded text-caption-bold text-[#FFFFFF] hover:text-[rgba(255,255,255,0.8)] active:opacity-80 focus-visible:outline-2 focus-visible:outline-gray-400"
                  >
                    수정
                    <ModifyIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    aria-label="댓글 삭제"
                    className="flex items-center gap-1 rounded text-caption-bold text-error hover:text-red-400 active:opacity-80 focus-visible:outline-2 focus-visible:outline-error"
                  >
                    삭제
                    <RemoveIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            {!isEditing && (
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
                      comment.ref.kind === 'slide'
                        ? `${refLabel}로 이동`
                        : `영상 ${refLabel}로 이동`
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
            )}
          </div>

          {!isEditing && (
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
          )}
        </div>
      </div>

      {isEditing && (
        <CommentInput
          value={editDraft}
          onChange={setEditDraft}
          onSubmit={handleSubmitEdit}
          onCancel={cancelEdit}
          autoFocus
          className="pb-4 pr-4 pl-15 bg-gray-200"
          textareaClassName="text-body-s text-black"
        />
      )}

      {replyingToId === comment.id && (
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
        <div>
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} isIndented rootCommentId={resolvedRootId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(Comment);
