/**
 * @file SlideViewer.tsx
 * @description 피드백 화면 좌측 슬라이드 뷰어
 */
import type { SlideListItem } from '@/types/slide';

import SlideInfoPanel from './slide/SlideInfoPanel';

interface SlideViewerProps {
  slide: SlideListItem | undefined;
  script?: string;
  slideIndex: number;
  totalSlides: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function SlideViewer({
  slide,
  script,
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
    <div className="flex-1 flex items-start justify-center min-w-0 bg-gray-100">
      <div className="flex flex-col max-w-full max-h-full">
        <div className="flex items-center justify-center">
          <img src={slide.imageUrl} alt={slide.title} className="max-w-full max-h-full shadow-lg" />
        </div>

        <SlideInfoPanel
          script={script}
          slideIndex={slideIndex}
          totalSlides={totalSlides}
          isFirst={isFirst}
          isLast={isLast}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
    </div>
  );
}
