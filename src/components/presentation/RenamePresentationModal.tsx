import { type KeyboardEvent, useEffect, useRef } from 'react';

import { Modal, TextField } from '../common';

type Props = {
  isOpen: boolean;
  currentTitle: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onTitleChange: (title: string) => void;
};

export default function RenamePresentationModal({
  isOpen,
  currentTitle,
  isPending = false,
  onClose,
  onConfirm,
  onTitleChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="이름 변경"
      size="sm"
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
    >
      <TextField
        ref={inputRef}
        type="text"
        value={currentTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        placeholder="발표 제목을 입력하세요"
        spellCheck={false}
      />
      <div className="mt-7 flex gap-3">
        <button
          className="flex-1 rounded-md bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          type="button"
          onClick={onClose}
          disabled={isPending}
        >
          취소
        </button>
        <button
          className="flex-1 rounded-md bg-main py-3 font-bold text-white hover:bg-main/90 transition-colors disabled:opacity-50"
          type="button"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
      </div>
    </Modal>
  );
}
