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
    <div className="flex items-start gap-2">
      {/* 번호 - 썸네일 바깥 왼쪽 */}
      <span className="w-4 pt-0.5 text-right text-xs font-semibold text-gray-800 select-none">
        {index + 1}
      </span>

      {/* 썸네일 - 16:9 비율 */}
      <Link
        to={`${basePath}/slide/${slide.id}`}
        aria-current={isActive ? 'true' : undefined}
        className={clsx(
          'block flex-1 aspect-video rounded overflow-hidden',
          'outline outline-2 -outline-offset-2',
          'focus-visible:outline-main',
          isActive ? 'outline-main' : 'outline-transparent hover:outline-gray-300',
        )}
      >
        <div className="h-full w-full bg-gray-200" />
      </Link>
    </div>
  );
}
