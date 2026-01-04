import { useState } from 'react';

import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';
import { Popover } from '@/components/common';

interface SlideTitleProps {
  initialTitle?: string;
  isCollapsed?: boolean;
  onSave?: (title: string) => void;
}

export default function SlideTitle({
  initialTitle = '슬라이드 1',
  isCollapsed = false,
  onSave,
}: SlideTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const [editTitle, setEditTitle] = useState(initialTitle);

  const handleSave = () => {
    setTitle(editTitle);
    onSave?.(editTitle);
  };

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label="슬라이드 이름 변경"
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 active:bg-gray-200"
        >
          <span className="max-w-30 line-clamp-1">{title}</span>
          <ArrowDownIcon
            className={clsx(
              'h-4 w-4 transition-transform duration-300',
              isOpen !== isCollapsed && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      )}
      position={isCollapsed ? 'top' : 'bottom'}
      align="start"
      ariaLabel="슬라이드 이름 변경"
      className="flex w-80 items-center gap-2 border border-gray-200 px-3 py-2"
    >
      <input
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        aria-label="슬라이드 이름"
        className="h-9 flex-1 rounded-md border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-main"
      />
      <button
        type="button"
        onClick={handleSave}
        className="h-9 rounded-full bg-main px-3 text-sm font-semibold text-white active:bg-main-variant2"
      >
        저장
      </button>
    </Popover>
  );
}
