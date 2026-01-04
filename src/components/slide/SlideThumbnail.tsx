/**
 * @file SlideThumbnail.tsx
 * @description 개별 슬라이드 썸네일 아이템
 *
 * SlideList 내부에서 사용되며, 슬라이드 번호와 미리보기를 표시합니다.
 * 현재 선택된 슬라이드는 시각적으로 구분됩니다.
 */
import { Link } from 'react-router-dom';

import clsx from 'clsx';

import type { Slide } from '@/types/slide';

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  basePath: string;
}

export default function SlideThumbnail({ slide, index, isActive, basePath }: SlideThumbnailProps) {
  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-2 bg-gray-100',
        isActive ? 'border-main' : 'border-gray-200',
      )}
    >
      <div className="w-6 pt-2 text-right text-sm font-semibold text-gray-700 select-none">
        {index + 1}
      </div>
      <Link
        to={`${basePath}/slide/${slide.id}`}
        aria-current={isActive ? 'true' : undefined}
        className={clsx(
          'block w-full h-40 overflow-hidden',
          'focus:outline-none focus:ring-2 focus:ring-main',
        )}
      >
        <div
          className={clsx(
            'h-full w-full transition',
            isActive ? 'bg-gray-200' : 'bg-gray-200 hover:bg-gray-200',
          )}
        />
      </Link>
    </div>
  );
}
