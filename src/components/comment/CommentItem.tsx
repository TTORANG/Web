/**
 * @file CommentItem.tsx
 * @description 댓글 항목 공통 컴포넌트
 *
 * 슬라이드 화면(CommentPopover)과 피드백 화면(CommentList) 모두에서 사용됩니다.
 * theme prop으로 Light/Dark 스타일을 지원합니다.
 */
// ✅ [수정] Hooks 추가 (높이 조절용)
import React, { useCallback, useEffect, useRef } from 'react';

import clsx from 'clsx';

import FileIcon from '@/assets/icons/icon-document.svg?react';
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
  // ✅ [추가] 재귀를 위해 "ID로 삭제하는 원본 함수"도 받아야 함
  onDeleteComment?: (id: string) => void;
  /** 슬라이드 참조 클릭 핸들러 (선택적) */
  onGoToSlideRef?: (ref: string) => void;
  /** 들여쓰기 여부 (플랫 구조에서 답글 표시용) */
  isIndented?: boolean;
  // ✅ [추가] 재귀(무한 대댓글)를 위해 필요한 상태 Props
  replyingToId?: string | null;
  setReplyingToId?: (id: string | null) => void;

  // ✅ 재귀에서 특정 댓글 id로 submit/toggle 호출하려고 추가
  onReplySubmit?: (targetId: string) => void;
  onToggleReplyById?: (targetId: string) => void;
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

function CommentItem({
  comment,
  theme = 'light',
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
  // ✅ [추가] 재귀용 Props (기본값 처리로 에러 방지)
  replyingToId,
  setReplyingToId,
  onReplySubmit,
  onToggleReplyById,
}: CommentItemProps) {
  const styles = themeStyles[theme];

  // ✅ [수정] Textarea 높이 자동 조절 로직
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
                <span
                  className={clsx('max-w-50 truncate text-body-s-bold text-white', styles.author)}
                >
                  {comment.author}
                </span>
                <span className={clsx('text-caption text-gray-400', styles.time)}>
                  {formatRelativeTime(comment.timestamp)}
                </span>
              </div>

              {comment.isMine && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="댓글 삭제"
                  className="flex items-center gap-1 text-caption-bold text-error active:opacity-80"
                >
                  삭제
                  <RemoveIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className={clsx('text-body-s', styles.content)}>
              {comment.slideRef && onGoToSlideRef && (
                <button
                  type="button"
                  onClick={handleGoToSlideRef}
                  className="text-body-s-bold text-main-variant1 hover:underline mr-1 inline-flex items-center align-middle"
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
              aria-label={`${comment.author}에게 답글 달기`}
              className={clsx(
                'flex items-center gap-1 text-caption-bold transition',
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
          <textarea
            ref={textareaRef}
            autoFocus
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="댓글을 입력하세요"
            rows={1}
            aria-label="답글 입력"
            className={clsx(
              // 1. 레이아웃 & 폰트: 우리 스타일 (text-body-s, pb-2, resize-none)
              'w-full overflow-hidden resize-none bg-transparent border-b border-gray-200 text-body-s text-white pb-2 focus:border-white outline-none placeholder-gray-400 transition-colors',
              // 2. 색상: 팀원이 잡아둔 테마 스타일 (border, text color)
              styles.input,
            )}
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancelReply}
              aria-label="답글 취소"
              className={clsx(
                'px-3 py-1.5 rounded-full text-caption-bold text-gray-200 bg-gray-800 hover:bg-gray-900 transition',
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
                'px-3 py-1.5 rounded-full text-caption-bold text-gray-400 bg-white hover:bg-white/20 transition',
                replyText.trim() ? styles.submitButton : styles.submitButtonDisabled,
              )}
            >
              답글
            </button>
          </div>
        </div>
      )}

      {/* ✅ [수정] 무한 답글(재귀) 렌더링 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              theme={theme}
              // 1. 활성 상태 확인 로직
              isActive={replyingToId === reply.id}
              onToggleReply={() => handleChildToggle(reply.id)}
              // 3. 재귀용 상태 전달 (동일)
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              // 4. 입력 상태 전달 (동일)
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              // 5. [핵심 수정] 제출 버튼 클릭 시 '이 대댓글의 ID'로 제출 함수 실행
              // 기존: onSubmitReply (부모 ID가 바인딩된 함수) -> 수정: onReplySubmit(현재 ID)
              onSubmitReply={() => handleChildSubmit(reply.id)}
              // 6. 취소/삭제 등 나머지 전달
              onCancelReply={onCancelReply}
              onDelete={() => handleChildDelete(reply.id)}
              onDeleteComment={onDeleteComment}
              onGoToSlideRef={onGoToSlideRef}
              // 7. 재귀를 위해 헬퍼 함수들을 계속 밑으로 전달
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
