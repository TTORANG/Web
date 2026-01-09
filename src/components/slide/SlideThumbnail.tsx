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
    <Link
      to={`${basePath}/slide/${slide.id}`}
      aria-current={isActive ? 'true' : undefined}
      className={clsx(
        'group flex items-start gap-2 px-2 py-1 -mx-2 -my-1 rounded-sm transition-colors',
        isActive ? 'bg-main-variant1' : 'hover:bg-white',
      )}
    >
      {/* 번호 - 썸네일 바깥 왼쪽 */}
      <span
        className={clsx(
          'w-4 pt-1 text-right text-caption font-semibold select-none transition-colors',
          isActive ? 'text-white' : 'text-gray-800',
        )}
      >
        {index + 1}
      </span>

      {/* 썸네일 - 16:9 비율 */}
      <div className="flex-1 aspect-video rounded-sm overflow-hidden">
        <div className="h-full w-full bg-gray-200" />
      </div>
    </Link>
  );
}
