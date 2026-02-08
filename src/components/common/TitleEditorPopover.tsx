/**
 * @file TitleEditorPopover.tsx
 * @description 제목 편집/정보 팝오버 컴포넌트
 *
 * readOnlyContent가 제공되면 InfoIcon + 정보 팝오버를 표시하고,
 * 없으면 ArrowDownIcon + 편집 팝오버를 표시합니다.
 */
import { type ReactNode, useEffect, useState } from 'react';

import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';
import InfoIcon from '@/assets/icons/icon-info.svg?react';

import { Popover } from './Popover';
import { TextField } from './TextField';

interface TitleEditorPopoverProps {
  title: string;
  onSave?: (newTitle: string, close: () => void) => void;
  readOnlyContent?: ReactNode;
  isCollapsed?: boolean;
  ariaLabel: string;
  isPending?: boolean;
  titleClassName?: string;
}

export function TitleEditorPopover({
  title,
  onSave,
  readOnlyContent,
  isCollapsed = false,
  ariaLabel,
  isPending = false,
  titleClassName = 'max-w-60 truncate',
}: TitleEditorPopoverProps) {
  const [editTitle, setEditTitle] = useState(title);

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  if (readOnlyContent) {
    return (
      <Popover
        trigger={
          <button
            type="button"
            aria-label={ariaLabel}
            className="hidden md:inline-flex h-7 items-center gap-1.5 rounded-md bg-transparent px-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main min-w-0"
          >
            <span className={titleClassName}>{title}</span>
            <InfoIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        }
        position="bottom"
        align="start"
        ariaLabel={ariaLabel}
        className="w-72 max-w-[90vw] rounded-2xl border border-gray-200 px-6 py-3"
      >
        {readOnlyContent}
      </Popover>
    );
  }

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label={ariaLabel}
          className="hidden md:inline-flex h-7 items-center gap-1.5 rounded-md bg-transparent px-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main min-w-0"
        >
          <span className={titleClassName}>{title}</span>
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
                onSave?.(editTitle, close);
              }
            }}
            disabled={isPending}
            aria-label={ariaLabel}
            className="h-9 flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() => onSave?.(editTitle, close)}
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
