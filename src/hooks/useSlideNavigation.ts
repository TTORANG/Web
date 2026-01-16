/**
 * @file useSlideNavigation.ts
 * @description 슬라이드 네비게이션 훅
 *
 * 슬라이드 간 이동(이전/다음)과 인덱스 관리를 담당합니다.
 * 데이터 fetching과 분리된 순수 네비게이션 로직입니다.
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

  /**
   * 슬라이드 참조 문자열로 이동 (예: "슬라이드 3")
   */
  const goToSlideRef = (slideRef: string) => {
    const match = slideRef.match(/\d+/);
    if (!match) return;

    const n = Number(match[0]);
    const idx = n - 1;

    if (Number.isNaN(idx) || idx < 0 || idx >= totalSlides) return;
    setSlideIndex(idx);
  };

  return {
    slideIndex,
    totalSlides,
    isFirst,
    isLast,
    goPrev,
    goNext,
    goToIndex,
    goToSlideRef,
  };
}
