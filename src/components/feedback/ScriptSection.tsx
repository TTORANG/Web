/**
 * @file ScriptSection.tsx
 * @description 비디오 피드백 대본 섹션
 * - 현재 재생 시간에 맞는 슬라이드 대본을 표시
 * - 자동 스크롤로 현재 대본이 최상단에 위치
 * - 수동 스크롤 시 자동 스크롤 일시 정지 후 2초 후 복구
 */
import { useEffect, useMemo, useRef, useState } from 'react';

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

    // scrollIntoView로 해당 요소를 컨테이너 상단으로 스크롤
    currentScriptItem.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // 스크롤 완료 후 플래그 해제 (300ms 후)
    const timer = setTimeout(() => {
      isScrollingRef.current = false;
    }, 300);

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

  return (
    <div
      ref={scriptSectionRef}
      onScroll={handleScriptScroll}
      className="flex-1 min-w-0 rounded-lg p-4 overflow-y-auto flex flex-col gap-2"
      style={{ backgroundColor: '#202227' }}
    >
      {slides.map((slide, index) => {
        const slideStartTime = slideChangeTimes[index] || 0;
        const isCurrentSlide = currentSlideIndex === index;
        const timeStr = `${Math.floor(slideStartTime / 60)}:${String(slideStartTime % 60).padStart(
          2,
          '0',
        )}`;

        return (
          <div
            key={`${slide.id}-${index}`}
            ref={(el) => {
              scriptItemsRef.current[index] = el;
            }}
            style={{
              backgroundColor: isCurrentSlide ? '#FFFFFF' : '#343841',
              scrollMarginTop: '0px', // scrollIntoView 시 상단에 딱 붙도록
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
