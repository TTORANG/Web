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
import { useSlideStore } from '@/stores/slideStore';

interface SlideTitleProps {
  isCollapsed?: boolean;
}

export default function SlideTitle({ isCollapsed = false }: SlideTitleProps) {
  const title = useSlideStore((state) => state.slide?.title ?? '');
  const updateSlide = useSlideStore((state) => state.updateSlide);
  const [editTitle, setEditTitle] = useState(title);

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  const handleSave = () => {
    updateSlide({ title: editTitle });
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
