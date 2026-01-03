import type { Slide } from '@/types/slide';

import SlideThumbnail from './SlideThumbnail';

interface SlideListProps {
  slides: Slide[];
  currentSlideId: string;
  basePath: string;
}

export default function SlideList({ slides, currentSlideId, basePath }: SlideListProps) {
  return (
    <aside className="w-80 min-w-80 h-full overflow-y-auto">
      <div className="flex flex-col gap-5 pr-10">
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
