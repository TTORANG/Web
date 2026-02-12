import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';

import { Skeleton } from '@/components/common';
import { useThemeStore } from '@/stores/themeStore';
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
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  const scriptSectionRef = useRef<HTMLDivElement>(null);
  const scriptItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const prevIndexRef = useRef<number>(-1);
  const isScrollingRef = useRef(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const currentSlideIndex = useMemo(() => {
    return getSlideIndexFromTime(currentTime, slideChangeTimes, slides.length - 1);
  }, [currentTime, slideChangeTimes, slides.length]);

  // 자동 스크롤 및 수동 스크롤 로직 (기존과 동일)
  useEffect(() => {
    if (prevIndexRef.current === currentSlideIndex) return;
    prevIndexRef.current = currentSlideIndex;
    if (!autoScroll || !scriptSectionRef.current) return;

    const currentScriptItem = scriptItemsRef.current[currentSlideIndex];
    if (currentScriptItem) {
      isScrollingRef.current = true;
      currentScriptItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentSlideIndex, autoScroll]);

  const handleScriptScroll = () => {
    if (isScrollingRef.current) return;
    setAutoScroll(false);
    onScroll?.();
  };

  useEffect(() => {
    if (autoScroll) return;
    const timer = setTimeout(() => setAutoScroll(true), 2000);
    return () => clearTimeout(timer);
  }, [autoScroll]);

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 bg-[#FFFFFF] dark:bg-[#343841]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-lg opacity-20 bg-[#343841] dark:bg-[#FFFFFF] animate-pulse"
          >
            <Skeleton width={30} height={20} />
            <Skeleton width="80%" height={16} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scriptSectionRef}
      onScroll={handleScriptScroll}
      tabIndex={0}
      className="flex-1 min-w-0 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 focus:outline-none bg-transparent"
    >
      {slides.map((slide, index) => {
        const isCurrent = currentSlideIndex === index;
        const slideStartTime = slideChangeTimes[index] || 0;
        const timeStr = formatVideoTimestamp(slideStartTime);

        /**
         * isDark 값에 따라 색상 직접 결정
         */
        const colors = {
          backgroundColor: isCurrent
            ? isDark
              ? '#FFFFFF'
              : '#343841' // 활성: 다크(흰배경), 라이트(회배경)
            : isDark
              ? '#343841'
              : '#FFFFFF', // 대기: 다크(회배경), 라이트(흰배경)
          color: isCurrent
            ? isDark
              ? '#343841'
              : '#FFFFFF' // 활성: 다크(회글자), 라이트(흰글자)
            : isDark
              ? '#FFFFFF'
              : '#343841', // 대기: 다크(흰글자), 라이트(회글자)
        };

        return (
          <div
            key={`${slide.slideId}-${index}`}
            ref={(el) => {
              scriptItemsRef.current[index] = el;
            }}
            onClick={() => {
              onSeek?.(slideStartTime);
              setAutoScroll(true);
            }}
            style={colors} // 계산된 색상 적용
            className={clsx(
              'flex gap-4 px-4 py-4 rounded-lg transition-all duration-300 cursor-pointer shadow-sm',
              isCurrent && 'font-bold shadow-md',
            )}
          >
            <span className="shrink-0 text-sm min-w-[45px]">{timeStr}</span>
            <p className="flex-1 text-sm leading-relaxed whitespace-pre-line">
              {slide.script || '(대본 없음)'}
            </p>
          </div>
        );
      })}
    </div>
  );
}
