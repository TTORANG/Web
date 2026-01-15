/**
 * @file SlideInfoPanel.tsx
 * @description 슬라이드 제목과 대본을 표시하는 패널
 */
import type { Slide } from '@/types/slide';

import SlideNavigation from './SlideNavigation';

interface Props {
  slide: Slide;
  slideIndex: number;
  totalSlides: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function SlideInfoPanel({
  slide,
  slideIndex,
  totalSlides,
  isFirst,
  isLast,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="h-62.5 bg-gray-100 px-5 mt-2 overflow-y-auto border-r border-gray-200">
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="text-body-m-bold text-black">{slide.title}</h2>

        <SlideNavigation
          slideIndex={slideIndex}
          totalSlides={totalSlides}
          isFirst={isFirst}
          isLast={isLast}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>

      <div className="bg-gray-200 rounded-xl p-3 my-2">
        <p className="text-body-s text-black" style={{ whiteSpace: 'pre-line' }}>
          {slide.script || '대본이 없습니다.'}
        </p>
      </div>
    </div>
  );
}
