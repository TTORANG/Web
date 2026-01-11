/**
 * @file CommentItem.tsx
 * @description 댓글 항목 공통 컴포넌트
 *
 * 슬라이드 화면(Opinion)과 피드백 화면(CommentList) 모두에서 사용됩니다.
 * theme prop으로 Light/Dark 스타일을 지원합니다.
 */
import clsx from 'clsx';

import fileIcon from '@/assets/component-dark/fileIcon.svg';
import RemoveIcon from '@/assets/icons/icon-remove.svg?react';
import ReplyIcon from '@/assets/icons/icon-reply.svg?react';
import type { CommentItem as CommentItemType } from '@/types/comment';
import { formatRelativeTime } from '@/utils/format';

type Theme = 'light' | 'dark';

interface CommentItemProps {
  comment: CommentItemType;
  theme?: Theme;
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
  /** 슬라이드 참조 클릭 핸들러 (선택적) */
  onGoToSlideRef?: (ref: string) => void;
  /** 들여쓰기 여부 (플랫 구조에서 답글 표시용) */
  isIndented?: boolean;
}

const themeStyles = {
  light: {
    container: 'bg-white',
    containerActive: 'bg-gray-100',
    author: 'text-gray-800',
    time: 'text-gray-600',
    content: 'text-gray-800',
    replyButton: 'text-main hover:text-main-variant1 active:text-main-variant2',
    replyButtonActive: 'text-gray-400',
    input: 'border-gray-400 text-gray-800 placeholder:text-gray-600 focus:border-main',
    cancelButton: 'text-gray-800 hover:text-gray-600',
    submitButton: 'bg-white text-main active:text-main-variant2',
    submitButtonDisabled: 'bg-white text-gray-400',
  },
  dark: {
    container: 'bg-transparent',
    containerActive: 'bg-gray-800',
    author: 'text-white',
    time: 'text-gray-400',
    content: 'text-white',
    replyButton: 'text-main hover:text-main-variant1',
    replyButtonActive: 'text-gray-400',
    input: 'border-gray-200 text-white placeholder-gray-400 focus:border-white',
    cancelButton: 'text-gray-200 bg-gray-800 hover:bg-gray-900',
    submitButton: 'bg-white text-gray-400 hover:bg-white/20',
    submitButtonDisabled: 'bg-white text-gray-400',
  },
};

export default function CommentItem({
  comment,
  theme = 'light',
  isActive,
  replyText,
  onReplyTextChange,
  onToggleReply,
  onSubmitReply,
  onCancelReply,
  onDelete,
  onGoToSlideRef,
  isIndented = false,
}: CommentItemProps) {
  const styles = themeStyles[theme];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitReply();
    }
  };

  return (
    <div>
      {/* 댓글 항목 */}
      <div
        className={clsx(
          'flex gap-3 py-3 pr-4 transition-colors',
          isIndented ? 'pl-15' : 'pl-4',
          isActive ? styles.containerActive : styles.container,
        )}
      >
        {/* 프로필 이미지 */}
        <div className="w-8 shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-400" />
        </div>

        {/* 댓글 내용 */}
        <div className="flex flex-1 flex-col gap-1 pt-1.5 min-w-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={clsx('max-w-50 truncate text-sm font-semibold', styles.author)}>
                  {comment.author}
                </span>
                <span className={clsx('text-xs font-medium', styles.time)}>
                  {formatRelativeTime(comment.timestamp)}
                </span>
              </div>

              {comment.isMine && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="댓글 삭제"
                  className="flex items-center gap-1 text-xs font-semibold text-error active:opacity-80"
                >
                  삭제
                  <RemoveIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className={clsx('text-sm font-medium', styles.content)}>
              {comment.slideRef && onGoToSlideRef && (
                <button
                  type="button"
                  onClick={() => onGoToSlideRef(comment.slideRef!)}
                  className="text-body-s-bold text-main-variant1 hover:underline mr-1 inline-flex items-center align-middle"
                >
                  <img src={fileIcon} alt="" className="h-4 w-4" />
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
              aria-label={`${comment.author}에게 답글 달기`}
              className={clsx(
                'flex items-center gap-1 text-xs font-semibold transition',
                isActive ? styles.replyButtonActive : styles.replyButton,
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
        <div
          className={clsx(
            'flex flex-col gap-1 pb-4 pr-4',
            isIndented ? 'pl-15' : 'pl-15',
            styles.containerActive,
          )}
        >
          <input
            type="text"
            autoFocus
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="댓글을 입력하세요"
            aria-label="답글 입력"
            className={clsx(
              'w-full border-b bg-transparent px-0.5 py-2 text-base font-semibold outline-none transition-colors',
              styles.input,
            )}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancelReply}
              aria-label="답글 취소"
              className={clsx(
                'px-3 py-1.5 text-xs font-semibold rounded-full',
                styles.cancelButton,
              )}
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSubmitReply}
              disabled={!replyText.trim()}
              aria-label="답글 등록"
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                replyText.trim() ? styles.submitButton : styles.submitButtonDisabled,
              )}
            >
              답글
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
