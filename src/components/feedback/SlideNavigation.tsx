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
    <div className="inline-flex items-center gap-1 rounded-full py-2">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className={[
          'grid h-6 w-6 place-items-center rounded-full',
          isFirst ? 'bg-white' : 'bg-gray-200 hover:bg-gray-400/30 transition',
        ].join(' ')}
      >
        <LeftArrow className="text-black" />
      </button>

      <div className="min-w-14 text-center text-body-m-bold text-gray-800">
        {slideIndex + 1} / {totalSlides}
      </div>

      <button
        onClick={onNext}
        disabled={isLast}
        className={[
          'grid h-6 w-6 place-items-center rounded-full',
          isLast ? 'bg-white' : 'bg-gray-200 hover:bg-gray-400/30 transition',
        ].join(' ')}
      >
        <RightArrow className="text-black" />
      </button>
    </div>
  );
}
