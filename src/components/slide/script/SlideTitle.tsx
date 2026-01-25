/**
 * @file SlideTitle.tsx
 * @description 슬라이드 제목 편집 팝오버
 *
 * ScriptBox 헤더에서 슬라이드 제목을 클릭하면 나타나는 편집 UI입니다.
 * Zustand store를 통해 슬라이드 제목을 읽고 업데이트합니다.
 */
import { useEffect, useState } from 'react';

import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';
import { Popover } from '@/components/common';
import { useSlideActions, useSlideId, useSlideTitle, useUpdateSlide } from '@/hooks';

interface SlideTitleProps {
  isCollapsed?: boolean;
  fallbackTitle?: string;
}

export default function SlideTitle({ isCollapsed = false, fallbackTitle }: SlideTitleProps) {
  const slideId = useSlideId();
  const title = useSlideTitle();
  const { updateSlide } = useSlideActions();
  const { mutate: updateSlideApi } = useUpdateSlide();
  const resolvedFallback = fallbackTitle?.trim() ? fallbackTitle : undefined;
  const resolvedTitle = title?.trim() ? title : (resolvedFallback ?? '');
  const [editTitle, setEditTitle] = useState(resolvedTitle);

  useEffect(() => {
    setEditTitle(resolvedTitle);
  }, [resolvedTitle]);

  /**
   * 변경된 제목을 저장합니다.
   */
  const handleSave = () => {
    const nextTitle = editTitle.trim() || resolvedFallback || title;
    if (!nextTitle) return;
    // ?? store ?? ????
    updateSlide({ title: nextTitle });

    // API ??
    if (slideId) {
      updateSlideApi({ slideId, data: { title: nextTitle } });
    }
  };

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label="슬라이드 이름 변경"
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-transparent px-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main"
        >
          <span className="whitespace-normal break-words">{resolvedTitle}</span>
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
      {({ close }) => (
        <>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
                close();
              }
            }}
            aria-label="슬라이드 이름"
            className="h-9 flex-1 rounded-md border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-main focus-visible:outline-2 focus-visible:outline-main"
          />
          <button
            type="button"
            onClick={() => {
              handleSave();
              close();
            }}
            className="h-9 rounded-full bg-main px-3 text-sm font-semibold text-white active:bg-main-variant2 focus-visible:outline-2 focus-visible:outline-main"
          >
            저장
          </button>
        </>
      )}
    </Popover>
  );
}
