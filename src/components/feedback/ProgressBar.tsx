/**
 * @file ProgressBar.tsx
 * @description 비디오 재생 프로그레스바 컴포넌트
 *
 * - 클릭/드래그로 seek
 * - 호버 시 썸네일 + 시간 미리보기
 * - 전역 마우스 이벤트로 바 밖에서도 스크러빙 가능
 */
import { useEffect, useRef, useState } from 'react';

import { REACTION_CONFIG } from '@/constants/reaction';
import type { ReactionType } from '@/types/script';
import type { Slide } from '@/types/slide';
import type { SegmentHighlight } from '@/types/video';
import { formatVideoTimestamp } from '@/utils/format';
import { getSlideIndexFromTime } from '@/utils/video';

interface TopReaction {
  type: ReactionType;
  count: number;
}

interface ProgressBarProps {
  /** 현재 재생 시간 (초) */
  currentTime: number;
  /** 비디오 총 길이 (초) */
  duration: number;
  /** seek 콜백 */
  onSeek: (time: number) => void;
  /** 슬라이드 목록 (썸네일 미리보기용) */
  slides?: Slide[];
  /** 슬라이드 전환 시간 배열 */
  slideChangeTimes?: number[];
  /** 현재 시간 기준 가장 많은 리액션 */
  topReaction?: TopReaction | null;
  /** 5초 버킷별 세그먼트 하이라이트 (재생바 위 이모지 표시) */
  segmentHighlights?: SegmentHighlight[];
}

export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  slides,
  slideChangeTimes,
  topReaction,
  segmentHighlights,
}: ProgressBarProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  const [hoverSlideIndex, setHoverSlideIndex] = useState<number | null>(null);

  const max = Math.max(duration, 0);
  const progressPercentage = max > 0 ? (currentTime / max) * 100 : 0;
  const slideMarkers = (slideChangeTimes ?? [])
    .filter((t) => t > 0 && t < max)
    .map((t) => ({ time: t, percent: max > 0 ? (t / max) * 100 : 0 }));

  // 마우스 X 좌표 → 비율 (0~1) 변환
  const getPercentFromClientX = (clientX: number) => {
    const bar = progressBarRef.current;
    if (!bar || !max) return 0;

    const rect = bar.getBoundingClientRect();
    const raw = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(raw, 1));
  };

  // 슬라이드 인덱스 계산 헬퍼
  const computeSlideIndex = (time: number): number | null => {
    if (!slides || !slides.length) return null;

    const times =
      slideChangeTimes && slideChangeTimes.length > 0
        ? slideChangeTimes
        : slides.map((_, i) => i * 10);

    return getSlideIndexFromTime(time, times, slides.length - 1);
  };

  // hover 상태 업데이트 헬퍼
  const updateHoverState = (clientX: number) => {
    const p = getPercentFromClientX(clientX);
    setHoverX(p);

    const hoverTime = p * max;
    setHoverSlideIndex(computeSlideIndex(hoverTime));
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = getPercentFromClientX(e.clientX);
    onSeek(p * max);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateHoverState(e.clientX);
    if (isScrubbing) {
      onSeek(getPercentFromClientX(e.clientX) * max);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsScrubbing(true);
    onSeek(getPercentFromClientX(e.clientX) * max);
  };

  const handleMouseEnter = () => setIsHoveringBar(true);

  const handleMouseLeave = () => {
    setIsHoveringBar(false);
    setHoverX(null);
    setHoverSlideIndex(null);
  };

  // 전역 마우스 이벤트로 스크러빙 처리 (바 밖에서도 동작)
  useEffect(() => {
    if (!isScrubbing) return;

    const onMove = (e: MouseEvent) => {
      updateHoverState(e.clientX);
      onSeek(getPercentFromClientX(e.clientX) * max);
    };

    const onUp = () => setIsScrubbing(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isScrubbing, max, onSeek]);

  return (
    <div
      ref={progressBarRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      className="group relative h-1 w-full cursor-pointer rounded-full bg-[rgba(26,26,26,0.66)] transition-all duration-150 hover:h-1.5 hover:ring-2 hover:ring-[#4F5BFF]/30 select-none"
    >
      {/* 슬라이드 전환 시점 마커 */}
      {slideMarkers.map((marker) => (
        <div
          key={`slide-marker-${marker.time}`}
          className="absolute top-1/2 h-1 w-0.5 -translate-y-1/2 bg-[#FFFFFF]"
          style={{ left: `${marker.percent}%`, marginLeft: '-1px' }}
        />
      ))}

      {/* 세그먼트 하이라이트 (5초 버킷별 대표 리액션) */}
      {segmentHighlights?.map((segment) => {
        const leftPercent = max > 0 ? (segment.startTime / max) * 100 : 0;
        return (
          <div
            key={`segment-${segment.startTime}`}
            className="absolute -top-6 flex flex-col items-center pointer-events-none"
            style={{ left: `${leftPercent}%` }}
            title={`${REACTION_CONFIG[segment.topReactionType].label} (${segment.count})`}
          >
            <span className="text-sm leading-none drop-shadow-md">
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
        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#4F5BFF] shadow transition-all duration-150 group-hover:h-4 group-hover:w-4"
        style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
      />

      {/* 현재 구간 최다 리액션 표시 */}
      {topReaction && topReaction.count > 0 && (
        <div
          className="absolute -top-7 text-[12px] leading-none text-white"
          style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%)' }}
        >
          <span>{REACTION_CONFIG[topReaction.type].emoji}</span>
        </div>
      )}

      {/* 호버 시 썸네일 + 시간 미리보기 */}
      {(isHoveringBar || isScrubbing) && hoverX !== null && (
        <div
          className="absolute -top-33 flex flex-col items-center gap-2 pointer-events-none"
          style={{
            left: `clamp(90px, ${hoverX * 100}%, calc(100% - 90px))`,
            transform: 'translateX(-50%)',
          }}
        >
          {slides && hoverSlideIndex !== null && slides[hoverSlideIndex] && (
            <img
              src={slides[hoverSlideIndex].thumb}
              alt="slide thumbnail"
              className="h-22.5 w-40 min-w-40 shrink-0 rounded border border-[#ffffff]/15 bg-gray-200 object-cover"
            />
          )}

          <div className="rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.66)] px-3 py-1 text-xs font-medium tabular-nums text-[#ffffff] whitespace-nowrap">
            {formatVideoTimestamp(hoverX * max)}
          </div>
        </div>
      )}
    </div>
  );
}
