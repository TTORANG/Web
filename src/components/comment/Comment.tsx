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
import EditIcon from '@/assets/icons/icon-edit.svg?react';
import RemoveIcon from '@/assets/icons/icon-remove.svg?react';
import ReplyIcon from '@/assets/icons/icon-reply.svg?react';
import { UserAvatar } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import type { Comment as CommentType } from '@/types/comment';
import { formatRelativeTime, formatVideoTimestamp } from '@/utils/format';

import { useCommentContext } from './CommentContext';
import CommentInput from './CommentInput';
import CommentReplies from './CommentReplies';

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
  const resolvedRootId = rootCommentId ?? comment.commentId;
  const {
    replyingToId,
    replyDraft,
    setReplyDraft,
    toggleReply,
    submitReply,
    cancelReply,
    deleteComment,
    editingId,
    editDraft,
    setEditDraft,
    startEdit,
    cancelEdit,
    submitEdit,
    goToRef,
    skipReplyFetch,
  } = useCommentContext();
  const currentUser = useAuthStore((state) => state.user);
  const emailLocalPart = currentUser?.email?.split('@')[0]?.toLowerCase() ?? '';
  const normalizedCurrentUserName = currentUser?.name?.trim() ?? '';
  const isEmailDerivedName =
    normalizedCurrentUserName.length > 0 &&
    emailLocalPart.length > 0 &&
    normalizedCurrentUserName.toLowerCase() === emailLocalPart;
  const myDisplayName =
    normalizedCurrentUserName && !isEmailDerivedName ? normalizedCurrentUserName : '나';

  // userId가 익명 세션 ID 형식인지 체크 (anon_xxx 또는 UUID 형식)
  const isAnonymousId = (id?: string) => {
    if (!id) return false;
    return id.startsWith('anon_') || /^[0-9a-f-]{36}$/i.test(id);
  };

  const authorName =
    comment.userName ??
    (comment.isMine
      ? myDisplayName
      : isAnonymousId(comment.userId)
        ? '익명 사용자'
        : comment.userId);
  const authorProfileImage =
    comment.userProfileImage ?? (comment.isMine ? currentUser?.profileImage : undefined);

  const isActive = replyingToId === comment.commentId;
  const isEditing = editingId === comment.commentId;

  const handleStartEdit = useCallback(() => {
    if (editingId === comment.commentId) return;
    startEdit(comment.commentId, comment.content);
  }, [startEdit, editingId, comment.commentId, comment.content]);

  const handleSubmitEdit = useCallback(() => {
    submitEdit(comment.commentId);
  }, [submitEdit, comment.commentId]);

  const handleToggleReply = useCallback(() => {
    toggleReply(comment.commentId);
  }, [toggleReply, comment.commentId]);

  const handleSubmitReply = useCallback(() => {
    // 항상 최상위 부모 댓글 ID로 답글 제출 (서버는 root에만 답글 허용)
    submitReply(resolvedRootId);
  }, [submitReply, resolvedRootId]);

  const handleDelete = useCallback(() => {
    deleteComment?.(comment.commentId);
  }, [deleteComment, comment.commentId]);

  const handleGoToRef = useCallback(() => {
    if (comment.ref) {
      goToRef(comment.ref);
    }
  }, [comment.ref, goToRef]);

  // ref에서 표시할 라벨 생성
  const commentRef = comment.ref;
  const refLabel = commentRef
    ? commentRef.kind === 'slide'
      ? `슬라이드 ${commentRef.index + 1}`
      : formatVideoTimestamp(commentRef.seconds)
    : null;

  const shouldShowRef = !!commentRef && !comment.isReply && !comment.parentId;

  return (
    <div id={`comment-${comment.commentId}`}>
      <div
        className={clsx(
          'flex gap-3 py-3 pr-4 transition-colors',
          isIndented ? 'pl-15' : 'pl-4',
          isEditing ? 'bg-gray-100' : isActive ? 'bg-gray-200' : 'bg-gray-100',
        )}
      >
        <div className="w-8 shrink-0">
          <UserAvatar src={authorProfileImage} alt={authorName} size={32} />
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

              {comment.isMine && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    aria-label="댓글 수정"
                    className={clsx(
                      'flex items-center gap-1 rounded text-caption-bold active:opacity-80 focus-visible:outline-2 focus-visible:outline-main transition-colors',
                      isEditing
                        ? 'text-gray-400'
                        : 'text-gray-600 hover:text-gray-800 active:text-gray-700',
                    )}
                  >
                    수정
                    <EditIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {deleteComment && (
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
              )}
            </div>

            {isEditing ? (
              <CommentInput
                value={editDraft}
                onChange={setEditDraft}
                onSubmit={handleSubmitEdit}
                onCancel={cancelEdit}
                submitLabel="저장"
                autoFocus
                textareaClassName="text-body-s text-black"
              />
            ) : (
              <div className="text-body-s text-black">
                {shouldShowRef && commentRef && (
                  <button
                    type="button"
                    onClick={handleGoToRef}
                    className={clsx(
                      'mr-2 inline-flex items-center align-middle rounded text-body-s-bold hover:underline focus-visible:outline-2 focus-visible:outline-main',
                      commentRef.kind === 'slide' ? 'text-main-variant1' : 'text-main',
                    )}
                    aria-label={
                      commentRef.kind === 'slide' ? `${refLabel}로 이동` : `영상 ${refLabel}로 이동`
                    }
                  >
                    {commentRef.kind === 'slide' && (
                      <FileIcon className="text-main-variant1" aria-hidden="true" />
                    )}
                    {commentRef.kind === 'slide' ? <>&nbsp;</> : null}
                    {refLabel}
                  </button>
                )}

                <span className="align-middle">{comment.content}</span>
              </div>
            )}
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

      {replyingToId === comment.commentId && (
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

      {!isIndented && (
        <CommentReplies
          serverId={skipReplyFetch ? undefined : comment.serverId}
          localReplies={comment.replies ?? []}
          rootCommentId={resolvedRootId}
        />
      )}
    </div>
  );
}

export default React.memo(Comment);
