import clsx from 'clsx';

import LeftArrow from '@/assets/icons/icon-arrow-left.svg?react';
import RightArrow from '@/assets/icons/icon-arrow-right.svg?react';

interface SlideNavigationProps {
  /** ?�재 ?�라?�드 ?�덱??(0-indexed) */
  slideIndex: number;
  /** ?�체 ?�라?�드 개수 */
  totalSlides: number;
  /** �?번째 ?�라?�드 ?��? */
  isFirst: boolean;
  /** 마�?�??�라?�드 ?��? */
  isLast: boolean;
  /** ?�전 ?�라?�드�??�동 */
  onPrev: () => void;
  /** ?�음 ?�라?�드�??�동 */
  onNext: () => void;
  /** layout style */
  layout?: 'inline' | 'spread';
  /** container className */
  className?: string;
}

/**
 * ?�라?�드 ?�비게이??
 *
 * ?�전/?�음 버튼�??�재 ?�치(n/total)�??�시?�니??
 */
export default function SlideNavigation({
  slideIndex,
  totalSlides,
  isFirst,
  isLast,
  onPrev,
  onNext,
  layout = 'inline',
  className,
}: SlideNavigationProps) {
  const isSpread = layout === 'spread';
  return (
    <div
      className={`${isSpread ? 'flex w-full items-center justify-between' : 'inline-flex items-center gap-4'} shrink-0 ${className ?? ''}`}
    >
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

      <div
        className={clsx(
          'text-body-m-bold text-gray-800',
          isSpread ? 'flex-1 text-center' : 'shrink-0',
        )}
      >
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
