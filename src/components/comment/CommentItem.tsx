/**
 * @file CommentItem.tsx
 * @description 댓글 항목 공통 컴포넌트
 *
 * 슬라이드 화면(CommentPopover)과 피드백 화면(CommentList) 모두에서 사용됩니다.
 * data-theme 속성에 따라 CSS 변수가 자동 반전되어 다크모드를 지원합니다.
 */
import React, { useCallback, useEffect, useRef } from 'react';

import clsx from 'clsx';

import FileIcon from '@/assets/icons/icon-document.svg?react';
import RemoveIcon from '@/assets/icons/icon-remove.svg?react';
import ReplyIcon from '@/assets/icons/icon-reply.svg?react';
import { MOCK_USERS } from '@/mocks/users';
import type { CommentItem as CommentItemType } from '@/types/comment';
import { formatRelativeTime } from '@/utils/format';

interface CommentItemProps {
  comment: CommentItemType;
  /** 현재 답글 입력 활성화 여부 */
  isActive: boolean;
  /** 답글 입력 값 */
  replyText: string;
  /** 답글 입력 변경 핸들러 */
  onReplyTextChange: (text: string) => void;
  /** 답글 버튼 토글 */
  onToggleReply: () => void;
  /** 답글 제출 */
  onSubmitReply: () => void;
  /** 답글 취소 */
  onCancelReply: () => void;
  /** 삭제 핸들러 (선택적) */
  onDelete?: () => void;
  // 재귀를 위해 "ID로 삭제하는 원본 함수"도 받아야 함
  onDeleteComment?: (id: string) => void;
  /** 슬라이드 참조 클릭 핸들러 (선택적) */
  onGoToSlideRef?: (ref: string) => void;
  /** 들여쓰기 여부 (플랫 구조에서 답글 표시용) */
  isIndented?: boolean;
  // 재귀(무한 대댓글)를 위해 필요한 상태 Props
  replyingToId?: string | null;
  setReplyingToId?: (id: string | null) => void;

  // 재귀에서 특정 댓글 id로 submit/toggle 호출하려고 추가
  onReplySubmit?: (targetId: string) => void;
  onToggleReplyById?: (targetId: string) => void;
}

function CommentItem({
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
  // 재귀용 Props (기본값 처리로 에러 방지)
  replyingToId,
  setReplyingToId,
  onReplySubmit,
  onToggleReplyById,
}: CommentItemProps) {
  // 사용자 정보 조회 (Mock Data Lookup)
  const user = MOCK_USERS.find((u) => u.id === comment.authorId);
  const authorName = user?.name ?? '알 수 없음';
  const authorProfileImage = user?.profileImage;

  // Textarea 높이 자동 조절 로직
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      // 활성화 시 자동 포커스
      textareaRef.current.focus();
    }
  }, [isActive, replyText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmitReply();
      }
    },
    [onSubmitReply],
  );

  // 렌더링될 때마다 새로운 익명 함수 () => ... 를 생성하는 것을 방지
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
      {/* 댓글 항목 */}
      <div
        className={clsx(
          'flex gap-3 py-3 pr-4 transition-colors',
          isIndented ? 'pl-15' : 'pl-4',
          isActive ? 'bg-gray-200' : 'bg-gray-100',
        )}
      >
        {/* 프로필 이미지 */}
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

        {/* 댓글 내용 */}
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

          {/* 답글 버튼 */}
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

      {/* 답글 입력 */}
      {isActive && (
        <div className="flex flex-col gap-1 pb-4 pr-4 pl-15 bg-gray-200">
          <textarea
            ref={textareaRef}
            autoFocus
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="댓글을 입력하세요"
            rows={1}
            aria-label="답글 입력"
            className="w-full overflow-hidden resize-none bg-transparent border-b border-gray-600 pb-2 text-body-s text-black placeholder:text-gray-600 focus:border-main outline-none transition-colors"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancelReply}
              aria-label="답글 취소"
              className="px-3 py-1.5 rounded-full text-caption-bold text-gray-800 hover:text-gray-600 transition focus-visible:outline-2 focus-visible:outline-main"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSubmitReply}
              disabled={!replyText.trim()}
              aria-label="답글 등록"
              className={clsx(
                'px-3 py-1.5 rounded-full text-caption-bold transition focus-visible:outline-2 focus-visible:outline-main',
                replyText.trim()
                  ? 'bg-main text-white hover:bg-main-variant1 active:bg-main-variant2'
                  : 'bg-gray-100 text-gray-600',
              )}
            >
              답글
            </button>
          </div>
        </div>
      )}

      {/* 무한 답글(재귀) 렌더링 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8">
          {comment.replies.map((reply) => (
            <CommentItem
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

export default React.memo(CommentItem);
