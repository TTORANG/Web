/**
 * @file SlideViewer.tsx
 * @description 피드백 화면 좌측 슬라이드 뷰어
 */
import type { Slide } from '@/types/slide';

import SlideInfoPanel from './slide/SlideInfoPanel';

interface SlideViewerProps {
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
}: SlideViewerProps) {
  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">슬라이드를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <img src={slide.thumb} alt={slide.title} className="max-w-full max-h-full shadow-lg" />
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
