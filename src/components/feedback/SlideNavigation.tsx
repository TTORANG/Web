import clsx from 'clsx';

import LeftArrow from '@/assets/icons/icon-arrow-left.svg?react';
import RightArrow from '@/assets/icons/icon-arrow-right.svg?react';

interface SlideNavigationProps {
  /** 현재 슬라이드 인덱스 (0-indexed) */
  slideIndex: number;
  /** 전체 슬라이드 개수 */
  totalSlides: number;
  /** 첫 번째 슬라이드 여부 */
  isFirst: boolean;
  /** 마지막 슬라이드 여부 */
  isLast: boolean;
  /** 이전 슬라이드로 이동 */
  onPrev: () => void;
  /** 다음 슬라이드로 이동 */
  onNext: () => void;
}

/**
 * 슬라이드 네비게이션
 *
 * 이전/다음 버튼과 현재 위치(n/total)를 표시합니다.
 */
export default function SlideNavigation({
  slideIndex,
  totalSlides,
  isFirst,
  isLast,
  onPrev,
  onNext,
}: SlideNavigationProps) {
  return (
    <div className="inline-flex items-center gap-4 shrink-0">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className={clsx(
          'grid size-6 shrink-0 place-items-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-main',
          isFirst
            ? 'border-gray-400 opacity-50 cursor-not-allowed'
            : 'border-gray-400 hover:border-gray-600',
        )}
      >
        <LeftArrow className="text-black" />
      </button>

      <div className="text-body-m-bold text-gray-800 shrink-0">
        {slideIndex + 1} / {totalSlides}
      </div>

      <button
        onClick={onNext}
        disabled={isLast}
        className={clsx(
          'grid size-6 shrink-0 place-items-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-main',
          isLast
            ? 'border-gray-400 opacity-50 cursor-not-allowed'
            : 'border-gray-400 hover:border-gray-600',
        )}
      >
        <RightArrow className="text-black" />
      </button>
    </div>
  );
}
