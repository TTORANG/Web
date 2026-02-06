import { useEffect, useState } from 'react';

import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';

import { Popover } from './Popover';
import { TextField } from './TextField';

interface TitleEditorPopoverProps {
  title: string;
  onSave: (newTitle: string, close: () => void) => void;
  readOnly?: boolean;
  isCollapsed?: boolean;
  ariaLabel: string;
  isPending?: boolean;
}

export function TitleEditorPopover({
  title,
  onSave,
  readOnly = false,
  isCollapsed = false,
  ariaLabel,
  isPending = false,
}: TitleEditorPopoverProps) {
  const [editTitle, setEditTitle] = useState(title);

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  if (readOnly) {
    return (
      <span className="hidden md:inline-flex h-7 items-center px-2 text-sm font-semibold text-gray-800">
        <span className="whitespace-normal break-words">{title}</span>
      </span>
    );
  }

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label={ariaLabel}
          className="hidden md:inline-flex h-7 items-center gap-1.5 rounded-md bg-transparent px-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main"
        >
          <span className="whitespace-normal break-words">{title}</span>
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
      ariaLabel={ariaLabel}
      className="flex w-80 items-center gap-2 border border-gray-200 px-3 py-2"
    >
      {({ close }) => (
        <>
          <TextField
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSave(editTitle, close);
              }
            }}
            disabled={isPending}
            aria-label={ariaLabel}
            className="h-9 flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() => onSave(editTitle, close)}
            disabled={isPending}
            className="h-9 rounded-full bg-main px-3 text-sm font-semibold text-white active:bg-main-variant2 focus-visible:outline-2 focus-visible:outline-main disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? '저장 중...' : '저장'}
          </button>
        </>
      )}
    </Popover>
  );
}
