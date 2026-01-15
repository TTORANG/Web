/**
 * @file SlideViewer.tsx
 * @description 피드백 화면 좌측 슬라이드 뷰어
 */
import { SlideImage } from '@/components/common';
import type { Slide } from '@/types/slide';

import SlideInfoPanel from './SlideInfoPanel';

interface Props {
  slide: Slide | undefined;
  slideIndex: number;
  totalSlides: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function SlideViewer({
  slide,
  slideIndex,
  totalSlides,
  isFirst,
  isLast,
  onPrev,
  onNext,
}: Props) {
  if (!slide) {
    return (
      <div className="ml-35 flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">슬라이드를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="ml-35 flex-1 flex flex-col min-w-0 bg-gray-100">
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <div className="aspect-video w-full max-h-full bg-gray-400 relative overflow-hidden shadow-lg">
          {slide.thumb && <SlideImage key={slide.id} src={slide.thumb} alt={slide.title} />}
        </div>
      </div>

      <SlideInfoPanel
        slide={slide}
        slideIndex={slideIndex}
        totalSlides={totalSlides}
        isFirst={isFirst}
        isLast={isLast}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
}
