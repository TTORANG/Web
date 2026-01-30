/**
 * @file SlideInfoPanel.tsx
 * @description 슬라이드 제목과 대본을 표시하는 패널
 */
import SlideTitle from '@/components/slide/script/SlideTitle';
import type { Slide } from '@/types/slide';

import SlideNavigation from '../SlideNavigation';

interface SlideInfoPanelProps {
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
}: SlideInfoPanelProps) {
  return (
    <div className="shrink-0 flex flex-col gap-4 px-5 py-4">
      <div className="flex justify-between items-center gap-4">
        <div className="min-w-0">
          <SlideTitle fallbackTitle={`슬라이드 ${slideIndex + 1}`} />
        </div>

        <SlideNavigation
          slideIndex={slideIndex}
          totalSlides={totalSlides}
          isFirst={isFirst}
          isLast={isLast}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>

      <div className="bg-gray-200 rounded-t-lg px-4 py-3 h-48 overflow-y-auto">
        <p
          className={`text-body-s ${slide.script ? 'text-black' : 'text-gray-600'}`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {slide.script || '대본이 없습니다.'}
        </p>
      </div>
    </div>
  );
}
