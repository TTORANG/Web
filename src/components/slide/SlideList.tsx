/**
 * @file SlideList.tsx
 * @description 슬라이드 썸네일 목록 (좌측 사이드바)
 *
 * 슬라이드 페이지 좌측에 위치하며, 전체 슬라이드를 썸네일로 보여줍니다.
 * 클릭 시 해당 슬라이드로 이동하며, 현재 선택된 슬라이드가 하이라이트됩니다.
 * 위/아래 화살표 키로 슬라이드 간 이동이 가능합니다.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useHotkey } from '@/hooks';
import type { Slide } from '@/types/slide';

import { SlideThumbnail, SlideThumbnailSkeleton } from './SlideThumbnail';

/** 로딩 시 표시할 스켈레톤 개수 */
const SKELETON_COUNT = 3;

interface SlideListProps {
  slides?: Slide[];
  currentSlideId?: string;
  basePath: string;
  isLoading?: boolean;
}

export default function SlideList({ slides, currentSlideId, basePath, isLoading }: SlideListProps) {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const currentIndex = slides?.findIndex((slide) => slide.id === currentSlideId) ?? -1;

  const navigateToSlide = useCallback(
    (index: number) => {
      if (!slides || index < 0 || index >= slides.length) return;
      navigate(`${basePath}/slide/${slides[index].id}`);
    },
    [slides, basePath, navigate],
  );

  const keyMap = useMemo(
    () => ({
      ArrowUp: () => navigateToSlide(currentIndex - 1),
      ArrowDown: () => navigateToSlide(currentIndex + 1),
    }),
    [currentIndex, navigateToSlide],
  );

  useHotkey(keyMap, { enabled: !isLoading && !!slides?.length });

  // 현재 슬라이드가 변경되면 해당 썸네일로 스크롤
  useEffect(() => {
    if (!listRef.current || currentIndex < 0) return;

    const container = listRef.current;
    const activeItem = container.children[currentIndex] as HTMLElement | undefined;

    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentIndex]);

  return (
    <aside className="w-60 shrink-0 h-full overflow-y-auto">
      <div ref={listRef} className="flex flex-col gap-3 p-2">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SlideThumbnailSkeleton key={i} index={i} />
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
