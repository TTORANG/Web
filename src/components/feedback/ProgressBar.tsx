/**
 * @file ProgressBar.tsx
 * @description 비디오 재생 프로그레스바 컴포넌트
 *
 * - 클릭/드래그로 seek
 * - 호버 시 썸네일 + 시간 미리보기
 * - pointer 이벤트로 모바일/데스크톱 스크러빙 공통 처리
 */
import { useCallback, useRef, useState } from 'react';

import clsx from 'clsx';

import { REACTION_CONFIG } from '@/constants/reaction';
import type { SlideListItem } from '@/types/slide';
import type { SegmentHighlight } from '@/types/video';
import { formatVideoTimestamp } from '@/utils/format';
import { getSlideIndexFromTime } from '@/utils/video';

interface ProgressBarProps {
  /** 현재 재생 시간 (초) */
  currentTime: number;
  /** 비디오 총 길이 (초) */
  duration: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** seek 콜백 */
  onSeek: (time: number) => void;
  /** 슬라이드 목록 (썸네일 미리보기용) */
  slides?: SlideListItem[];
  /** 슬라이드 전환 시간 배열 */
  slideChangeTimes?: number[];
  /** 5초 버킷별 세그먼트 하이라이트 (재생바 위 이모지 표시) */
  segmentHighlights?: SegmentHighlight[];
}

export default function ProgressBar({
  currentTime,
  duration,
  disabled = false,
  onSeek,
  slides,
  slideChangeTimes,
  segmentHighlights,
}: ProgressBarProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercent, setScrubPercent] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  const [isHoveringEmoji, setIsHoveringEmoji] = useState(false);
  const [hoverSlideIndex, setHoverSlideIndex] = useState<number | null>(null);

  const clampPercent = (percent: number) => Math.min(100, Math.max(0, percent));
  const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const basePercent = max > 0 && Number.isFinite(currentTime) ? (currentTime / max) * 100 : 0;
  const progressPercentage = clampPercent(scrubPercent !== null ? scrubPercent * 100 : basePercent);
  const thumbLeft =
    progressPercentage <= 0
      ? '1px'
      : progressPercentage >= 100
        ? 'calc(100% - 1px)'
        : `${progressPercentage}%`;
  const thumbTranslateX =
    progressPercentage <= 0 ? '0%' : progressPercentage >= 100 ? '-100%' : '-50%';

  // 마우스 X 좌표 → 비율 (0~1) 변환
  const getPercentFromClientX = useCallback(
    (clientX: number) => {
      const bar = progressBarRef.current;
      if (!bar || !max) return 0;

      const rect = bar.getBoundingClientRect();
      const raw = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(raw, 1));
    },
    [max],
  );

  // 슬라이드 인덱스 계산 헬퍼
  const computeSlideIndex = useCallback(
    (time: number): number | null => {
      if (!slides || !slides.length) return null;

      const times =
        slideChangeTimes && slideChangeTimes.length > 0
          ? slideChangeTimes
          : slides.map((_, i) => i * 10);

      return getSlideIndexFromTime(time, times, slides.length - 1);
    },
    [slides, slideChangeTimes],
  );

  // hover 상태 업데이트 헬퍼
  const updateHoverState = useCallback(
    (clientX: number) => {
      const p = getPercentFromClientX(clientX);
      setHoverX(p);

      const hoverTime = p * max;
      setHoverSlideIndex(computeSlideIndex(hoverTime));
    },
    [getPercentFromClientX, max, computeSlideIndex],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.preventDefault();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // no-op: 일부 환경에서는 pointer capture를 지원하지 않을 수 있음
    }

    const p = getPercentFromClientX(e.clientX);
    setIsScrubbing(true);
    setScrubPercent(p);
    setIsHoveringBar(true);
    setHoverX(p);
    setHoverSlideIndex(computeSlideIndex(p * max));
    onSeek(p * max);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (isScrubbing) {
      if (e.pointerType === 'touch') {
        e.preventDefault();
      }

      const p = getPercentFromClientX(e.clientX);
      setScrubPercent(p);
      setHoverX(p);
      setHoverSlideIndex(computeSlideIndex(p * max));
      onSeek(p * max);
      return;
    }

    if (e.pointerType === 'mouse') {
      updateHoverState(e.clientX);
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.pointerType === 'mouse') {
      setIsHoveringBar(true);
    }
  };

  const clearScrubState = (pointerId: number, currentTarget: HTMLDivElement) => {
    try {
      currentTarget.releasePointerCapture(pointerId);
    } catch {
      // no-op
    }

    setIsScrubbing(false);
    setScrubPercent(null);
    setIsHoveringBar(false);
    setHoverX(null);
    setHoverSlideIndex(null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    clearScrubState(e.pointerId, e.currentTarget);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    clearScrubState(e.pointerId, e.currentTarget);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) return;
    if (e.pointerType === 'mouse') {
      setIsHoveringBar(false);
      setHoverX(null);
      setHoverSlideIndex(null);
    }
  };

  return (
    <div
      ref={progressBarRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={clsx(
        "group relative h-1 w-full rounded-full bg-[rgba(26,26,26,0.66)] transition-all duration-150 select-none before:content-[''] before:absolute before:-inset-y-3 before:inset-x-0",
        disabled
          ? 'cursor-not-allowed opacity-70'
          : 'touch-none cursor-pointer hover:h-1.5 hover:ring-2 hover:ring-[#4F5BFF]/30',
      )}
    >
      {/* 프로그레스바 위 흰색 마커 (슬라이드 전환 시점) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        {slideChangeTimes?.map((time, index) => {
          if (!Number.isFinite(time) || max <= 0 || time < 0 || time > max) return null;

          const percent = clampPercent((time / max) * 100);
          const markerTranslateX = percent <= 0 ? '0%' : percent >= 100 ? '-100%' : '-50%';

          return (
            <div
              key={`marker-${time}-${index}`}
              className="absolute top-1/2 z-10 h-1.5 w-0.5 rounded-full bg-[#FFFFFF]/70"
              style={{ left: `${percent}%`, transform: `translate(${markerTranslateX}, -50%)` }}
            />
          );
        })}
      </div>

      {/* 세그먼트 하이라이트 (5초 버킷별 대표 리액션) */}
      {segmentHighlights?.map((segment, index) => {
        if (!Number.isFinite(segment.startTime) || max <= 0 || segment.startTime < 0) return null;

        const percent = clampPercent((segment.startTime / max) * 100);
        return (
          <div
            key={`segment-${segment.startTime}-${segment.topReactionType}-${index}`}
            className="absolute -top-5 z-10 flex flex-col gap-0.5 items-center cursor-pointer"
            style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
            title={`${REACTION_CONFIG[segment.topReactionType].label} (${segment.count})`}
            onMouseEnter={() => setIsHoveringEmoji(true)}
            onMouseLeave={() => setIsHoveringEmoji(false)}
            onClick={(e) => {
              if (disabled) return;
              e.stopPropagation();
              onSeek(segment.startTime);
            }}
          >
            <span className="text-xs leading-none">
              {REACTION_CONFIG[segment.topReactionType].emoji}
            </span>
          </div>
        );
      })}

      {/* 진행 바 */}
      <div
        className="absolute h-full rounded-full bg-[#4F5BFF]"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* 진행 핸들 */}
      <div
        className="absolute top-1/2 h-3 w-3 rounded-full bg-[#4F5BFF] shadow transition-[width,height] duration-150 group-hover:h-4 group-hover:w-4"
        style={{
          left: thumbLeft,
          transform: `translate(${thumbTranslateX}, -50%)`,
        }}
      />

      {/* 호버 시 썸네일 + 시간 미리보기 */}
      {!disabled && (isHoveringBar || isScrubbing) && !isHoveringEmoji && hoverX !== null && (
        <div
          className="absolute -top-33 flex flex-col items-center gap-2 pointer-events-none"
          style={{
            left: `clamp(90px, ${hoverX * 100}%, calc(100% - 90px))`,
            transform: 'translateX(-50%)',
          }}
        >
          {slides && hoverSlideIndex !== null && slides[hoverSlideIndex] && (
            <img
              src={slides[hoverSlideIndex].imageUrl}
              alt="slide thumbnail"
              className="h-22.5 w-40 min-w-40 shrink-0 rounded bg-gray-200 object-cover"
            />
          )}

          <div className="rounded-full bg-[rgba(18,18,20,0.78)] px-3 py-1 text-xs font-medium tabular-nums text-[#ffffff] whitespace-nowrap backdrop-blur-[6px]">
            {formatVideoTimestamp(hoverX * max)}
          </div>
        </div>
      )}
    </div>
  );
}
