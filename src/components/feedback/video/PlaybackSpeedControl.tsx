/**
 * @file PlaybackSpeedControl.tsx
 * @description 영상 재생 속도 컨트롤
 */
import { useMemo } from 'react';

import clsx from 'clsx';

import { Popover } from '@/components/common';
import {
  VIDEO_PLAYBACK_RATE_MAX,
  VIDEO_PLAYBACK_RATE_MIN,
  VIDEO_PLAYBACK_RATE_PRESETS,
  VIDEO_PLAYBACK_RATE_STEP,
} from '@/utils/video';

interface PlaybackSpeedControlProps {
  playbackRate: number;
  onPlaybackRateChange: (nextRate: number) => void;
  disabled?: boolean;
}

function formatPlaybackRateLabel(rate: number): string {
  return `${rate.toFixed(2)}x`;
}

function formatPresetLabel(rate: number): string {
  return Number.isInteger(rate) ? rate.toFixed(1) : String(rate);
}

export default function PlaybackSpeedControl({
  playbackRate,
  onPlaybackRateChange,
  disabled = false,
}: PlaybackSpeedControlProps) {
  const canDecrease = playbackRate > VIDEO_PLAYBACK_RATE_MIN;
  const canIncrease = playbackRate < VIDEO_PLAYBACK_RATE_MAX;

  const progressPercent = useMemo(() => {
    const range = VIDEO_PLAYBACK_RATE_MAX - VIDEO_PLAYBACK_RATE_MIN;
    if (range <= 0) return 0;
    return ((playbackRate - VIDEO_PLAYBACK_RATE_MIN) / range) * 100;
  }, [playbackRate]);

  const sliderStyle = useMemo(
    () => ({
      background: `linear-gradient(
      to right,
      #4F5BFF ${progressPercent}%,
      rgba(255,255,255,0.25) ${progressPercent}%
    )`,
    }),
    [progressPercent],
  );

  const handleDecrease = () => {
    onPlaybackRateChange(playbackRate - VIDEO_PLAYBACK_RATE_STEP);
  };

  const handleIncrease = () => {
    onPlaybackRateChange(playbackRate + VIDEO_PLAYBACK_RATE_STEP);
  };

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          className={clsx(
            'h-9 min-w-14 rounded-full bg-[rgba(18,18,20,0.78)] px-3 text-caption font-semi-bold tabular-nums text-[#ffffff] transition-colors duration-150 hover:bg-[rgba(18,18,20,0.88)]',
            isOpen && 'bg-[rgba(18,18,20,0.88)]',
            disabled && 'cursor-not-allowed opacity-60',
          )}
          aria-label="재생 속도 설정"
          disabled={disabled}
        >
          {formatPlaybackRateLabel(playbackRate)}
        </button>
      )}
      position="top"
      align="end"
      ariaLabel="재생 속도"
      className="w-72 max-w-[calc(100vw-1rem)] rounded-2xl bg-[rgba(18,18,20,0.85)] p-3 text-[#ffffff] shadow-lg backdrop-blur-[6px]"
    >
      {() => (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-caption text-[#ffffff]/90">재생 속도</span>
            <span className="text-caption-bold tabular-nums text-[#ffffff]">
              {formatPlaybackRateLabel(playbackRate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecrease}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(18,18,20,0.78)] text-xl leading-none text-[#ffffff] transition-colors duration-150 hover:bg-[rgba(18,18,20,0.88)] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="재생 속도 감소"
              disabled={!canDecrease}
            >
              -
            </button>

            <input
              type="range"
              min={VIDEO_PLAYBACK_RATE_MIN}
              max={VIDEO_PLAYBACK_RATE_MAX}
              step={VIDEO_PLAYBACK_RATE_STEP}
              value={playbackRate}
              onChange={(event) => onPlaybackRateChange(Number(event.target.value))}
              style={sliderStyle}
              className="block h-1 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFFFFF] [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#FFFFFF]"
              aria-label="재생 속도 슬라이더"
            />

            <button
              type="button"
              onClick={handleIncrease}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(18,18,20,0.78)] text-xl leading-none text-[#ffffff]  transition-colors duration-150 hover:bg-[rgba(18,18,20,0.88)] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="재생 속도 증가"
              disabled={!canIncrease}
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {VIDEO_PLAYBACK_RATE_PRESETS.map((presetRate) => {
              const isActive = Math.abs(playbackRate - presetRate) < 0.001;
              return (
                <button
                  key={presetRate}
                  type="button"
                  onClick={() => onPlaybackRateChange(presetRate)}
                  className={clsx(
                    'h-8 rounded-full whitespace-nowrap px-1 text-caption tabular-nums  transition-colors duration-150',
                    isActive
                      ? 'bg-[rgba(18,18,20,0.88)] font-semi-bold text-[#4F5BFF]'
                      : 'bg-[rgba(18,18,20,0.78)] text-[#ffffff]/88 hover:bg-[rgba(18,18,20,0.88)]',
                  )}
                  aria-pressed={isActive}
                >
                  {formatPresetLabel(presetRate)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Popover>
  );
}
