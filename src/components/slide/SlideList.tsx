/**
 * @file SlideList.tsx
 * @description 슬라이드 썸네일 목록 (좌측 사이드바)
 *
 * 슬라이드 페이지 좌측에 위치하며, 전체 슬라이드를 썸네일로 보여줍니다.
 * 클릭 시 해당 슬라이드로 이동하며, 현재 선택된 슬라이드가 하이라이트됩니다.
 */
import type { Slide } from '@/types/slide';

import SlideThumbnail from './SlideThumbnail';

/** 로딩 시 표시할 스켈레톤 개수 */
const SKELETON_COUNT = 6;

interface SlideListProps {
  slides?: Slide[];
  currentSlideId?: string;
  basePath: string;
  isLoading?: boolean;
}

export default function SlideList({ slides, currentSlideId, basePath, isLoading }: SlideListProps) {
  return (
    <aside className="w-60 shrink-0 h-full overflow-y-auto">
      <div className="flex flex-col gap-3 p-2">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4" />
                <div className="flex-1 aspect-video rounded bg-gray-200 animate-pulse" />
              </div>
            ))
          : slides?.map((slide, idx) => (
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
