import type { KeyboardEvent } from 'react';

import clsx from 'clsx';

interface ReplyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ReplyInput({ value, onChange, onSubmit, onCancel }: ReplyInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-1 bg-gray-100 pb-4 pl-15 pr-4">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="댓글을 입력하세요"
        aria-label="답글 입력"
        className="w-full border-b border-gray-400 bg-transparent px-0.5 py-2 text-base font-semibold text-gray-800 outline-none placeholder:text-gray-600 focus:border-main"
        autoFocus
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          aria-label="답글 취소"
          className="px-3 py-1.5 text-xs font-semibold text-gray-800 hover:text-gray-600"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          aria-label="답글 등록"
          className={clsx(
            'rounded-full bg-white px-3 py-1.5 text-xs font-semibold',
            value.trim() ? 'text-main active:text-main-variant2' : 'text-gray-400',
          )}
        >
          답글
        </button>
      </div>
    </div>
  );
}
