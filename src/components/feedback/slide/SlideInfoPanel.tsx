/**
 * @file SlideInfoPanel.tsx
 * @description 슬라이드 제목과 대본을 표시하는 패널
 */
import SlideTitle from '@/components/slide/script/SlideTitle';

import SlideNavigation from '../SlideNavigation';

interface SlideInfoPanelProps {
  script?: string;
  slideIndex: number;
  totalSlides: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function SlideInfoPanel({
  script,
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
          <SlideTitle fallbackTitle={`슬라이드 ${slideIndex + 1}`} readOnly />
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

      <div className="bg-gray-200 rounded-lg px-4 py-3 max-h-48 overflow-y-auto">
        <p
          className={`text-body-s ${script ? 'text-black' : 'text-gray-600'}`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {script || '대본이 없습니다.'}
        </p>
      </div>
    </div>
  );
}
