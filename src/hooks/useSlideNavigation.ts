import { useState } from 'react';

interface UseSlideNavigationOptions {
  initialIndex?: number;
}

/**
 * 슬라이드 네비게이션 훅
 *
 * 슬라이드 간 이동과 인덱스 관리를 담당합니다.
 *
 * @param totalSlides - 전체 슬라이드 수
 * @param options.initialIndex - 초기 인덱스 (기본값: 0)
 * @returns slideIndex - 현재 슬라이드 인덱스
 * @returns isFirst - 첫 번째 슬라이드 여부
 * @returns isLast - 마지막 슬라이드 여부
 * @returns goPrev - 이전 슬라이드로 이동
 * @returns goNext - 다음 슬라이드로 이동
 * @returns goToIndex - 특정 인덱스로 이동
 */
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
