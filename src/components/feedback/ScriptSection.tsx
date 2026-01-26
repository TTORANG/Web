/**
 * @file ScriptSection.tsx
 * @description 비디오 피드백 대본 섹션
 * - 현재 재생 시간에 맞는 슬라이드 대본을 표시
 * - 자동 스크롤로 현재 대본이 최상단에 위치
 * - 수동 스크롤 시 자동 스크롤 일시 정지 후 1초 후 복구
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Slide } from '@/types/slide';
import { getSlideIndexFromTime } from '@/utils/video';

interface ScriptSectionProps {
  slides: Slide[];
  slideChangeTimes: number[];
  currentTime: number;
  onScroll?: () => void;
}

export default function ScriptSection({
  slides,
  slideChangeTimes,
  currentTime,
  onScroll,
}: ScriptSectionProps) {
  const scriptSectionRef = useRef<HTMLDivElement>(null);
  const scriptItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);

  // 현재 시간에 따른 슬라이드 인덱스 계산
  const getCurrentSlideIndex = useCallback(() => {
    return getSlideIndexFromTime(currentTime, slideChangeTimes, slides.length - 1);
  }, [currentTime, slideChangeTimes, slides.length]);

  // 자동 스크롤 로직
  useEffect(() => {
    if (!autoScroll || !scriptSectionRef.current) return;

    // requestAnimationFrame을 사용해 브라우저 렌더링 후 스크롤
    const animationFrameId = requestAnimationFrame(() => {
      const currentSlideIndex = getCurrentSlideIndex();
      const currentScriptItem = scriptItemsRef.current[currentSlideIndex];

      if (currentScriptItem && scriptSectionRef.current) {
        const container = scriptSectionRef.current;
        const itemTop = currentScriptItem.offsetTop;
        const containerPadding = 16; // p-4 = 16px

        // 현재 항목이 컨테이너의 첫 번째 위치에 오도록 스크롤
        const targetScroll = Math.max(0, itemTop - containerPadding);

        container.scrollTop = targetScroll;
      }
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [currentTime, autoScroll, getCurrentSlideIndex]);

  // 수동 스크롤 감지 - autoScroll 비활성화
  const handleScriptScroll = useCallback(() => {
    setAutoScroll(false);
    onScroll?.();
  }, [onScroll]);

  // 슬라이드 변경 시 자동 스크롤 재활성화
  useEffect(() => {
    if (autoScroll) return;

    const timer = setTimeout(() => {
      setAutoScroll(true);
    }, 1000); // 1초 후 다시 활성화

    return () => clearTimeout(timer);
  }, [getCurrentSlideIndex(), autoScroll]);

  return (
    <div
      ref={scriptSectionRef}
      onScroll={handleScriptScroll}
      className="flex-1 min-w-0 rounded-lg p-4 overflow-y-auto flex flex-col gap-2"
      style={{ backgroundColor: '#202227' }}
    >
      {slides.map((slide, index) => {
        const slideStartTime = slideChangeTimes[index] || 0;
        const isCurrentSlide = getCurrentSlideIndex() === index;
        const timeStr = `${Math.floor(slideStartTime / 60)}:${String(slideStartTime % 60).padStart(2, '0')}`;

        return (
          <div
            key={`${slide.id}-${index}`}
            ref={(el) => {
              if (el) {
                scriptItemsRef.current[index] = el;
              }
            }}
            style={{
              backgroundColor: isCurrentSlide ? '#FFFFFF' : '#343841',
            }}
            className="flex gap-3 px-4 py-3 rounded-lg transition-colors"
          >
            <div
              style={{
                color: isCurrentSlide ? '#343841' : '#A9ACB2',
              }}
              className="shrink-0 font-medium text-sm min-w-10"
            >
              {timeStr}
            </div>
            <div
              style={{
                color: isCurrentSlide ? '#1A1B1F' : '#E2E4E8',
              }}
              className="flex-1 text-sm leading-relaxed"
            >
              {slide.script || '(대본 없음)'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
