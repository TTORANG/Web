/**
 * @file CommentInput.tsx
 * @description 댓글/답글 입력 공통 컴포넌트
 *
 * FeedbackSlidePage, CommentItem 등에서 재사용됩니다.
 * textarea 높이 자동 조절, Enter 키 제출을 지원합니다.
 */
import { useCallback, useEffect, useRef } from 'react';

import clsx from 'clsx';

interface CommentInputProps {
  /** 입력값 (controlled) */
  value: string;
  /** 입력값 변경 핸들러 */
  onChange: (value: string) => void;
  /** 제출 핸들러 (Enter 키 또는 버튼 클릭) */
  onSubmit: () => void;
  /** 취소 핸들러 */
  onCancel: () => void;
  /** textarea placeholder */
  placeholder?: string;
  /** 제출 버튼 라벨 */
  submitLabel?: string;
  /** 마운트 시 자동 포커스 */
  autoFocus?: boolean;
  /** 컨테이너 className */
  className?: string;
  /** textarea className */
  textareaClassName?: string;
}

/**
 * 댓글/답글 입력 컴포넌트
 *
 * @example
 * <CommentInput
 *   value={draft}
 *   onChange={setDraft}
 *   onSubmit={handleSubmit}
 *   onCancel={() => setDraft('')}
 * />
 */
export default function CommentInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = '댓글을 입력하세요',
  submitLabel = '답글',
  autoFocus = false,
  className,
  textareaClassName,
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = !value.trim();

  /** textarea 높이를 내용에 맞게 자동 조절 */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );

  const handleCancel = useCallback(() => {
    onCancel();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [onCancel]);

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        rows={1}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label={placeholder}
        className={clsx(
          'w-full overflow-hidden resize-none bg-transparent border-b border-gray-600 pt-2 pb-2 outline-none placeholder:text-gray-600 focus:border-main transition-colors',
          textareaClassName ?? 'text-body-m-bold text-black',
        )}
      />

      <div className="flex gap-2 items-center justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 py-1.5 rounded-full text-caption-bold text-gray-800 hover:opacity-80 transition focus-visible:outline-2 focus-visible:outline-main"
        >
          취소
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isEmpty}
          className={clsx(
            'px-3 py-1.5 rounded-full text-caption-bold transition focus-visible:outline-2 focus-visible:outline-main',
            isEmpty
              ? 'bg-white text-gray-400 cursor-not-allowed'
              : 'bg-main text-white hover:opacity-90',
          )}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
