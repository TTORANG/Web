/**
 * 슬라이드 네비게이션 훅
 *
 * 슬라이드 간 이동과 인덱스 관리를 담당합니다.
 *
 * @param totalSlides - 전체 슬라이드 수
 * @param options.initialIndex - 초기 인덱스 (기본값: 0)
 */
import { useState } from 'react';

interface UseSlideNavigationOptions {
  initialIndex?: number;
}

export function useSlideNavigation(totalSlides: number, options: UseSlideNavigationOptions = {}) {
  const { initialIndex = 0 } = options;
  const [slideIndex, setSlideIndex] = useState(initialIndex);

  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;

  const goPrev = () => {
    if (isFirst) return;
    setSlideIndex((i) => i - 1);
  };

  const goNext = () => {
    if (isLast) return;
    setSlideIndex((i) => i + 1);
  };

  const goToIndex = (index: number) => {
    if (index < 0 || index >= totalSlides) return;
    setSlideIndex(index);
  };

  return {
    slideIndex,
    totalSlides,
    isFirst,
    isLast,
    goPrev,
    goNext,
    goToIndex,
  };
}
