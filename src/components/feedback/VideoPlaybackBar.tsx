/**
 * @file VideoPlaybackBar.tsx
 * @description (FD_VID_01 - 4/5) 재생바 + 조작 섹션 컴포넌트
 *
 * - 실제 플레이어는 부모의 videoRef(<video>)
 * - store.currentTime으로 UI를 그리고, 클릭/드래그로 videoRef를 seek
 * - 호버 시 해당 시점의 슬라이드 썸네일 + 시간 표시
 * - 볼륨 아이콘에 호버하면 "pill(둥근 배경) + 슬라이더"가 펼쳐져서 조절 가능
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import muteIcon from '@/assets/playbackBar-icons/mute-icon.webp';
import pauseIcon from '@/assets/playbackBar-icons/pause-icon.webp';
import playIcon from '@/assets/playbackBar-icons/play-icon.webp';
import fullscreenIcon from '@/assets/playbackBar-icons/sizeupdown-icon.webp';
import unmuteIcon from '@/assets/playbackBar-icons/unmute-icon.webp';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Slide } from '@/types/slide';
import { formatVideoTimestamp } from '@/utils/format';

type VideoPlaybackBarProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
  fullscreenTargetRef?: React.RefObject<HTMLElement>;
  slides?: Slide[];
  slideChangeTimes?: number[];
};

export default function VideoPlaybackBar({
  videoRef,
  duration,
  fullscreenTargetRef,
  slides,
  slideChangeTimes,
}: VideoPlaybackBarProps) {
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const progressBarRef = useRef<HTMLDivElement>(null);

  const max = useMemo(() => Math.max(duration, 0), [duration]);
  const progressPercentage = max > 0 ? (currentTime / max) * 100 : 0;

  const volumePercent = Math.round(volume * 100);
  const volumeTrackStyle: React.CSSProperties = {
    background: `linear-gradient(
      to right,
      rgba(255,255,255,0.95) ${volumePercent}%,
      rgba(255,255,255,0.35) ${volumePercent}%
    )`,
  };

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  const [hoverSlideIndex, setHoverSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);

    setIsPlaying(!el.paused);
    setVolume(el.volume ?? 1);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [videoRef]);

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;

    if (el.paused) {
      try {
        await el.play();
      } catch {
        // autoplay 정책 등
      }
    } else {
      el.pause();
    }
  };

  const scrubTo = (next: number) => {
    const el = videoRef.current;
    if (!el) return;

    el.currentTime = next;
    updateCurrentTime(next);
  };

  const changeVolume = (v: number) => {
    const el = videoRef.current;
    setVolume(v);
    if (el) el.volume = v;
  };

  const toggleFullscreen = async () => {
    const target = fullscreenTargetRef?.current;
    const root = target ?? (videoRef.current?.closest('[data-stage-root]') as HTMLElement | null);

    if (!root) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await root.requestFullscreen();
    }
  };

  const getPercentFromClientX = (clientX: number) => {
    const bar = progressBarRef.current;
    if (!bar || !max) return 0;

    const rect = bar.getBoundingClientRect();
    const raw = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(raw, 1));
  };

  const getSlideIndexFromTime = (time: number): number | null => {
    if (!slides || !slides.length) return null;

    const times =
      slideChangeTimes && slideChangeTimes.length > 0
        ? slideChangeTimes
        : slides.map((_, i) => i * 10);

    let idx = 0;
    for (let i = 0; i < times.length; i += 1) {
      if (times[i] <= time) idx = i;
      else break;
    }

    return Math.max(0, Math.min(idx, slides.length - 1));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = getPercentFromClientX(e.clientX);
    scrubTo(p * max);
  };

  const onBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = getPercentFromClientX(e.clientX);
    setHoverX(p);

    const hoverTime = p * max;
    const slideIdx = getSlideIndexFromTime(hoverTime);
    setHoverSlideIndex(slideIdx);

    if (isScrubbing) scrubTo(p * max);
  };

  const onBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsScrubbing(true);

    const p = getPercentFromClientX(e.clientX);
    scrubTo(p * max);
  };

  const onBarMouseEnter = () => setIsHoveringBar(true);
  const onBarMouseLeave = () => {
    setIsHoveringBar(false);
    setHoverX(null);
    setHoverSlideIndex(null);
  };

  // 전역 마우스 이벤트로 스크러빙 처리 (바 밖에서도 동작)
  useEffect(() => {
    if (!isScrubbing) return;

    const onMove = (e: MouseEvent) => {
      const p = getPercentFromClientX(e.clientX);
      setHoverX(p);

      const hoverTime = p * max;
      const slideIdx = getSlideIndexFromTime(hoverTime);
      setHoverSlideIndex(slideIdx);

      scrubTo(p * max);
    };

    const onUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isScrubbing, max]);

  return (
    <div className="flex w-full flex-col gap-2">
      {/* 재생바 */}
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        onMouseMove={onBarMouseMove}
        onMouseEnter={onBarMouseEnter}
        onMouseLeave={onBarMouseLeave}
        onMouseDown={onBarMouseDown}
        className="group relative h-1 w-full cursor-pointer rounded-full bg-gray-700/70 transition-all duration-150 hover:h-1.5 hover:ring-2 hover:ring-blue-500/30 select-none"
      >
        <div
          className="absolute h-full rounded-full bg-blue-600"
          style={{ width: `${progressPercentage}%` }}
        />

        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-blue-600 shadow transition-all duration-150 group-hover:h-4 group-hover:w-4"
          style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
        />

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

      {/* 조작 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 재생 / 일시정지 */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.66)]"
            aria-label={isPlaying ? '일시정지' : '재생'}
          >
            <img
              src={isPlaying ? pauseIcon : playIcon}
              alt={isPlaying ? '일시정지' : '재생'}
              className="h-7 w-7"
            />
          </button>

          {/* 볼륨: 아이콘에 hover하면 pill + 슬라이더가 펼쳐짐 */}
          <div className="group/vol relative flex items-center gap-2">
            {/* 아이콘(항상 노출) - pill 위에 보이도록 z-10 */}
            <button
              type="button"
              onClick={() => changeVolume(volume === 0 ? 1 : 0)}
              className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.66)]"
              aria-label="음소거"
            >
              <img
                src={volume === 0 ? muteIcon : unmuteIcon}
                alt={volume === 0 ? '음소거 해제' : '음소거'}
                className="h-7 w-7"
              />
            </button>

            {/* pill: 기본은 숨김 -> hover 시 나타남 */}
            <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/vol:opacity-100 transition-opacity duration-150">
              {/* pill 배경 */}
              <div className="flex items-center gap-2 rounded-full bg-[#000000]/45 px-3 h-8">
                {/* 아이콘 자리(이미 왼쪽에 실아이콘이 있으니 빈공간만) */}
                <div className="h-7 w-5 shrink-0" />

                {/* 슬라이더 */}
                <div className="w-15 pointer-events-auto flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    style={volumeTrackStyle}
                    className="volume-range block w-full h-0.5 cursor-pointer appearance-none rounded-full"
                    aria-label="볼륨"
                  />
                </div>
              </div>
            </div>

            {/* 시간 - hover 시 오른쪽으로 슬라이드 */}
            <div className="whitespace-nowrap rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.66)] px-3 py-1.5 text-xs font-medium tabular-nums text-[#ffffff] transition-all duration-150 group-hover/vol:translate-x-19">
              <span>{formatVideoTimestamp(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatVideoTimestamp(max)}</span>
            </div>
          </div>
        </div>

        {/* 전체화면 */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.66)]"
          aria-label="전체화면"
        >
          <img src={fullscreenIcon} alt="전체화면" className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
