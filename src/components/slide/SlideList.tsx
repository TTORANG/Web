/**
 * @file SlideList.tsx
 * @description 슬라이드 썸네일 목록 (좌측 사이드바)
 *
 * 슬라이드 페이지 좌측에 위치하며, 전체 슬라이드를 썸네일로 보여줍니다.
 * 클릭 시 해당 슬라이드로 이동하며, 현재 선택된 슬라이드가 하이라이트됩니다.
 */
import type { Slide } from '@/types/slide';

import SlideThumbnail from './SlideThumbnail';

interface SlideListProps {
  slides: Slide[];
  currentSlideId: string;
  basePath: string;
}

export default function SlideList({ slides, currentSlideId, basePath }: SlideListProps) {
  return (
    <aside className="w-52 shrink-0 h-full overflow-y-auto">
      <div className="flex flex-col gap-4 pr-4">
        {slides.map((slide, idx) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={idx}
            isActive={slide.id === currentSlideId}
            basePath={basePath}
          />
        ))}
      </div>
    </aside>
  );
}
