/**
 * @file VideoPlaybackBar.tsx
 * @description Playback controls and progress UI.
 */
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import pauseIcon from '@/assets/playbackBar-icons/pause-icon.webp';
import playIcon from '@/assets/playbackBar-icons/play-icon.webp';
import fullscreenIcon from '@/assets/playbackBar-icons/sizeupdown-icon.webp';
import ProgressBar from '@/components/feedback/ProgressBar';
import PlaybackSpeedControl from '@/components/feedback/video/PlaybackSpeedControl';
import VolumeControl from '@/components/feedback/video/VolumeControl';
import { useVideoReactionHighlights } from '@/hooks/queries/useVideoReactionQueries';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { SlideListItem } from '@/types/slide';
import {
  DEFAULT_VIDEO_PLAYBACK_RATE,
  VIDEO_PLAYBACK_RATE_STORAGE_KEY,
  normalizeVideoPlaybackRate,
} from '@/utils/video';

const MAX_HIGHLIGHTS = 10;

function getStoredPlaybackRate(): number {
  if (typeof window === 'undefined') return DEFAULT_VIDEO_PLAYBACK_RATE;
  const stored = window.localStorage.getItem(VIDEO_PLAYBACK_RATE_STORAGE_KEY);
  return normalizeVideoPlaybackRate(stored);
}

interface VideoPlaybackBarProps {
  videoElement: HTMLVideoElement | null;
  duration: number;
  isMediaReady?: boolean;
  fullscreenTargetRef?: React.RefObject<HTMLElement>;
  slides?: SlideListItem[];
  slideChangeTimes?: number[];
  layoutToggle?: {
    label: ReactNode;
    onToggle: () => void;
    ariaLabel?: string;
  };
}

export default function VideoPlaybackBar({
  videoElement,
  duration,
  isMediaReady = true,
  fullscreenTargetRef,
  slides,
  slideChangeTimes,
  layoutToggle,
}: VideoPlaybackBarProps) {
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const videoId = useVideoFeedbackStore((s) => s.video?.videoId);

  // 최다리액션버킷상위10개의 대표이모지만 보여주기
  const { segmentHighlights } = useVideoReactionHighlights(videoId, duration, {
    intervalMs: 5000,
    topN: MAX_HIGHLIGHTS,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(() => getStoredPlaybackRate());
  const isControlDisabled = !videoElement || !isMediaReady;

  useEffect(() => {
    if (!videoElement) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);

    setIsPlaying(!videoElement.paused);
    setVolume(videoElement.volume ?? 1);

    return () => {
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
    };
  }, [videoElement]);

  useEffect(() => {
    if (!videoElement) return;

    const normalizedRate = normalizeVideoPlaybackRate(playbackRate);
    // eslint-disable-next-line react-hooks/immutability -- DOM API
    videoElement.playbackRate = normalizedRate;
    // eslint-disable-next-line react-hooks/immutability -- DOM API
    videoElement.defaultPlaybackRate = normalizedRate;
  }, [playbackRate, videoElement]);

  const handleSeek = (time: number) => {
    if (isControlDisabled || !videoElement) return;

    // eslint-disable-next-line react-hooks/immutability -- DOM API
    videoElement.currentTime = time;
    updateCurrentTime(time);
  };

  const togglePlay = useCallback(async () => {
    if (isControlDisabled || !videoElement) return;

    if (videoElement.paused) {
      try {
        await videoElement.play();
      } catch {
        // ignore autoplay block
      }
    } else {
      videoElement.pause();
    }
  }, [isControlDisabled, videoElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (isControlDisabled) return;
      e.preventDefault();
      void togglePlay();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isControlDisabled, togglePlay]);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    // eslint-disable-next-line react-hooks/immutability -- DOM API
    if (videoElement) videoElement.volume = v;
  };

  const handlePlaybackRateChange = (nextRate: number) => {
    const normalizedRate = normalizeVideoPlaybackRate(nextRate);
    setPlaybackRate(normalizedRate);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIDEO_PLAYBACK_RATE_STORAGE_KEY, String(normalizedRate));
    }
  };

  const toggleFullscreen = async () => {
    const target = fullscreenTargetRef?.current;
    const root = target ?? (videoElement?.closest('[data-stage-root]') as HTMLElement | null);

    if (!root) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await root.requestFullscreen();
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        disabled={isControlDisabled}
        onSeek={handleSeek}
        slides={slides}
        slideChangeTimes={slideChangeTimes}
        segmentHighlights={segmentHighlights}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(18,18,20,0.78)] backdrop-blur-[6px] transition-colors duration-150 hover:bg-[rgba(18,18,20,0.88)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={isPlaying ? '일시정지' : '재생'}
            disabled={isControlDisabled}
          >
            <img
              src={isPlaying ? pauseIcon : playIcon}
              alt={isPlaying ? '일시정지' : '재생'}
              className="h-7 w-7"
            />
          </button>

          <VolumeControl
            volume={volume}
            onVolumeChange={handleVolumeChange}
            currentTime={currentTime}
            duration={duration}
            isTimestampReady={isMediaReady}
          />
        </div>

        <div className="flex items-center gap-1">
          <PlaybackSpeedControl
            playbackRate={playbackRate}
            onPlaybackRateChange={handlePlaybackRateChange}
            disabled={isControlDisabled}
          />

          {layoutToggle && (
            <button
              type="button"
              onClick={layoutToggle.onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(18,18,20,0.78)] text-[#ffffff] backdrop-blur-[6px] transition-colors duration-150 hover:bg-[rgba(18,18,20,0.88)]"
              aria-label={layoutToggle.ariaLabel ?? '웹캠/슬라이드 전환'}
            >
              {layoutToggle.label}
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(18,18,20,0.78)] backdrop-blur-[6px] transition-colors duration-150 hover:bg-[rgba(18,18,20,0.88)]"
            aria-label="전체화면"
          >
            <img src={fullscreenIcon} alt="전체화면" className="h-7 w-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
