/**
 * @file CommentInput.tsx
 * @description 댓글/답글 입력 공통 컴포넌트
 *
 * FeedbackInput과 CommentItem에서 재사용됩니다.
 */
import { useCallback, useEffect, useRef } from 'react';

import clsx from 'clsx';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  /** 컨테이너 className (레이아웃 커스텀용) */
  className?: string;
  /** textarea className (텍스트 스타일 커스텀용) */
  textareaClassName?: string;
}

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

  // 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // autoFocus 처리
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
