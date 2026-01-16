/**
 * @file SlideNavigation.tsx
 * @description 슬라이드 네비게이션 (이전/다음 버튼 + 인덱스)
 */
import LeftArrow from '@/assets/icons/icon-arrow-left.svg?react';
import RightArrow from '@/assets/icons/icon-arrow-right.svg?react';

interface Props {
  slideIndex: number;
  totalSlides: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function SlideNavigation({
  slideIndex,
  totalSlides,
  isFirst,
  isLast,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="inline-flex items-center gap-4 shrink-0">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className={[
          'grid size-6 shrink-0 place-items-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-main',
          isFirst
            ? 'border-gray-400 opacity-50 cursor-not-allowed'
            : 'border-gray-400 hover:border-gray-600',
        ].join(' ')}
      >
        <LeftArrow className="text-black" />
      </button>

      <div className="text-body-m-bold text-gray-800 shrink-0">
        {slideIndex + 1} / {totalSlides}
      </div>

      <button
        onClick={onNext}
        disabled={isLast}
        className={[
          'grid size-6 shrink-0 place-items-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-main',
          isLast
            ? 'border-gray-400 opacity-50 cursor-not-allowed'
            : 'border-gray-400 hover:border-gray-600',
        ].join(' ')}
      >
        <RightArrow className="text-black" />
      </button>
    </div>
  );
}
