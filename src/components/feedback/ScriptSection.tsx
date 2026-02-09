/**
 * @file ScriptSection.tsx
 * @description 비디오 피드백 대본 섹션
 * - 현재 재생 시간에 맞는 슬라이드 대본을 표시
 * - 자동 스크롤로 현재 대본이 중앙에 위치
 * - 수동 스크롤 시 자동 스크롤 일시 정지 후 2초 후 복구
 */
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Skeleton } from '@/components/common';
import type { SlideListItem } from '@/types';
import { formatVideoTimestamp } from '@/utils/format';
import { getSlideIndexFromTime } from '@/utils/video';

interface ScriptSectionProps {
  slides: SlideListItem[];
  slideChangeTimes: number[];
  currentTime: number;
  onSeek?: (time: number) => void;
  onScroll?: () => void;
  isLoading?: boolean;
}

export default function ScriptSection({
  slides,
  slideChangeTimes,
  currentTime,
  onSeek,
  onScroll,
  isLoading = false,
}: ScriptSectionProps) {
  const scriptSectionRef = useRef<HTMLDivElement>(null);
  const scriptItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const prevIndexRef = useRef<number>(-1);
  const isScrollingRef = useRef(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // 현재 시간에 따른 슬라이드 인덱스 계산 (메모이제이션)
  const currentSlideIndex = useMemo(() => {
    return getSlideIndexFromTime(currentTime, slideChangeTimes, slides.length - 1);
  }, [currentTime, slideChangeTimes, slides.length]);

  // 자동 스크롤 로직 - 슬라이드 인덱스가 변경될 때만 실행
  useEffect(() => {
    // 인덱스가 변경되지 않았으면 스킵
    if (prevIndexRef.current === currentSlideIndex) return;
    prevIndexRef.current = currentSlideIndex;

    if (!autoScroll || !scriptSectionRef.current) return;

    const currentScriptItem = scriptItemsRef.current[currentSlideIndex];
    if (!currentScriptItem) return;

    // 프로그래매틱 스크롤 플래그 설정
    isScrollingRef.current = true;

    // scrollIntoView로 해당 요소를 컨테이너 중앙으로 스크롤
    currentScriptItem.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // 스크롤 완료 후 플래그 해제 (smooth scroll은 거리에 따라 500-1000ms 소요)
    const timer = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);

    return () => clearTimeout(timer);
  }, [currentSlideIndex, autoScroll]);

  // 수동 스크롤 감지 - 프로그래매틱 스크롤이 아닐 때만 autoScroll 비활성화
  const handleScriptScroll = () => {
    if (isScrollingRef.current) return; // 프로그래매틱 스크롤은 무시
    setAutoScroll(false);
    onScroll?.();
  };

  // 수동 스크롤 후 2초 뒤 자동 스크롤 재활성화
  useEffect(() => {
    if (autoScroll) return;

    const timer = setTimeout(() => {
      setAutoScroll(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [autoScroll]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(0, currentSlideIndex - 1);
      if (prevIndex !== currentSlideIndex) {
        onSeek?.(slideChangeTimes[prevIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(slides.length - 1, currentSlideIndex + 1);
      if (nextIndex !== currentSlideIndex) {
        onSeek?.(slideChangeTimes[nextIndex]);
      }
    }
  };

  const skeletonWidths = ['85%', '70%', '90%', '75%', '80%'];

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 bg-gray-100">
        {skeletonWidths.map((width, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-200">
            {/* 타임스탬프 */}
            <Skeleton width={26} height={22} rounded={4} className="shrink-0 bg-gray-400!" />
            {/* 대본 */}
            <Skeleton width={width} height={16} rounded={4} className="ml-4 bg-gray-400!" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scriptSectionRef}
      onScroll={handleScriptScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="flex-1 min-w-0 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 bg-gray-100 focus:outline-none"
    >
      {slides.map((slide, index) => {
        const slideStartTime = slideChangeTimes[index] || 0;
        const isCurrentSlide = currentSlideIndex === index;
        const timeStr = formatVideoTimestamp(slideStartTime);

        return (
          <div
            key={`${slide.slideId}-${index}`}
            ref={(el) => {
              scriptItemsRef.current[index] = el;
            }}
            style={{
              backgroundColor: isCurrentSlide ? '#FFFFFF' : '#343841',
            }}
            onClick={(e) => {
              onSeek?.(slideStartTime);
              const targetElement = e.currentTarget;
              if (targetElement) {
                isScrollingRef.current = true;
                targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
                setTimeout(() => {
                  isScrollingRef.current = false;
                }, 800);
                setAutoScroll(true);
              }
            }}
            className="flex gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out text-body-s cursor-pointer"
          >
            <div
              style={{
                color: isCurrentSlide ? '#343841' : '#A9ACB2',
              }}
              className="shrink-0 font-medium text-sm min-w-10 transition-colors duration-300"
            >
              {timeStr}
            </div>

            <div
              style={{
                color: isCurrentSlide ? '#1A1B1F' : '#E2E4E8',
                whiteSpace: 'pre-line',
              }}
              className="flex-1 text-sm leading-relaxed transition-colors duration-300"
            >
              {slide.script || '(대본 없음)'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
