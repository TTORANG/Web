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

import SlideThumbnail from './SlideThumbnail';

const SKELETON_COUNT = 3;

interface SlideListProps {
  /** 슬라이드 목록 */
  slides?: Slide[];
  /** 현재 선택된 슬라이드 ID */
  currentSlideId?: string;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 슬라이드 썸네일 목록 (좌측 사이드바)
 *
 * - 위/아래 화살표 키로 슬라이드 이동
 * - 현재 슬라이드 변경 시 자동 스크롤
 */
export default function SlideList({ slides, currentSlideId, isLoading }: SlideListProps) {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const currentIndex = slides?.findIndex((slide) => slide.id === currentSlideId) ?? -1;

  const navigateToSlide = useCallback(
    (index: number) => {
      if (!slides || index < 0 || index >= slides.length) return;
      navigate({ search: `?slideId=${slides[index].id}` }, { replace: true });
    },
    [slides, navigate],
  );

  const keyMap = useMemo(
    () => ({
      ArrowUp: () => navigateToSlide(currentIndex - 1),
      ArrowDown: () => navigateToSlide(currentIndex + 1),
    }),
    [currentIndex, navigateToSlide],
  );

  useHotkey(keyMap, { enabled: !isLoading && !!slides?.length });

  /** 현재 슬라이드 변경 시 해당 썸네일로 스크롤 */
  useEffect(() => {
    if (!listRef.current || currentIndex < 0) return;

    const container = listRef.current;
    const activeItem = container.children[currentIndex] as HTMLElement | undefined;

    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentIndex]);

  return (
    <aside className="w-60 shrink-0 h-full overflow-y-auto [scrollbar-gutter:stable]">
      <div ref={listRef} className="flex flex-col gap-3 px-3 py-2">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SlideThumbnail key={i} index={i} isLoading />
            ))
          : slides?.map((slide, idx) => (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                index={idx}
                isActive={slide.id === currentSlideId}
              />
            ))}
      </div>
    </aside>
  );
}
