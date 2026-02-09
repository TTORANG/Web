/**
 * @file VideoPlaybackBar.tsx
 * @description 비디오 재생바 + 조작 컨트롤 컴포넌트
 *
 * - ProgressBar: 재생 프로그레스 + 스크러빙 + 썸네일 미리보기
 * - VolumeControl: 볼륨 조절 + 시간 표시
 * - 재생/일시정지, 전체화면 버튼
 */
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import pauseIcon from '@/assets/playbackBar-icons/pause-icon.webp';
import playIcon from '@/assets/playbackBar-icons/play-icon.webp';
import fullscreenIcon from '@/assets/playbackBar-icons/sizeupdown-icon.webp';
import ProgressBar from '@/components/feedback/ProgressBar';
import VolumeControl from '@/components/feedback/video/VolumeControl';
import { useVideoReactionTimeline } from '@/hooks/queries/useVideoReactionQueries';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { ReactionType } from '@/types/script';
import type { SlideListItem } from '@/types/slide';
import type { SegmentHighlight } from '@/types/video';
import { computeSegmentHighlightsFromFeedbacks } from '@/utils/video';

const DEFAULT_TIMELINE_INTERVAL_MS = 5000;
const MAX_HIGHLIGHTS = 10;

const buildHighlightsFromTimeline = (
  timeline: {
    intervalMs: number;
    markers: Array<{ timestampMs: number; emojiType: ReactionType; count: number }>;
  },
  duration: number,
  topN: number,
): SegmentHighlight[] => {
  const intervalSec = timeline.intervalMs / 1000;
  const highlights = timeline.markers
    .map((marker) => {
      const startTime = marker.timestampMs / 1000;
      const endTime = Math.min(startTime + intervalSec, duration);
      return {
        startTime,
        endTime,
        topReactionType: marker.emojiType,
        count: marker.count,
        totalCount: marker.count,
      } as SegmentHighlight;
    })
    .filter((item) => item.totalCount > 0);

  return highlights
    .slice()
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, topN)
    .sort((a, b) => a.startTime - b.startTime);
};

interface VideoPlaybackBarProps {
  videoElement: HTMLVideoElement | null;
  duration: number;
  fullscreenTargetRef?: React.RefObject<HTMLElement>;
  slides?: SlideListItem[];
  slideChangeTimes?: number[];
  layoutToggle?: {
    label: ReactNode;
    onToggle: () => void;
  };
}

export default function VideoPlaybackBar({
  videoElement,
  duration,
  fullscreenTargetRef,
  slides,
  slideChangeTimes,
  layoutToggle,
}: VideoPlaybackBarProps) {
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const video = useVideoFeedbackStore((s) => s.video);
  const { data: timeline } = useVideoReactionTimeline(video?.videoId, DEFAULT_TIMELINE_INTERVAL_MS);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  // 5초 버킷별 세그먼트 하이라이트 계산 (최다 리액션 기반)
  const segmentHighlights = useMemo(() => {
    if (!video) return [];
    if (timeline) {
      return buildHighlightsFromTimeline(timeline, video.duration, MAX_HIGHLIGHTS);
    }
    return computeSegmentHighlightsFromFeedbacks(video.feedbacks, video.duration, MAX_HIGHLIGHTS);
  }, [video, timeline]);

  // 비디오 play/pause 이벤트 구독
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

  const handleSeek = (time: number) => {
    if (!videoElement) return;

    // eslint-disable-next-line react-hooks/immutability -- DOM API
    videoElement.currentTime = time;
    updateCurrentTime(time);
  };

  const togglePlay = useCallback(async () => {
    if (!videoElement) return;

    if (videoElement.paused) {
      try {
        await videoElement.play();
      } catch {
        // autoplay 정책 등
      }
    } else {
      videoElement.pause();
    }
  }, [videoElement]);

  // Spacebar로 재생/일시정지 토글
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      e.preventDefault();
      void togglePlay();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    // eslint-disable-next-line react-hooks/immutability -- DOM API
    if (videoElement) videoElement.volume = v;
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
      {/* 재생 프로그레스바 */}
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        slides={slides}
        slideChangeTimes={slideChangeTimes}
        segmentHighlights={segmentHighlights}
      />

      {/* 조작 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 재생/일시정지 버튼 */}
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

          {/* 볼륨 + 시간 표시 */}
          <VolumeControl
            volume={volume}
            onVolumeChange={handleVolumeChange}
            currentTime={currentTime}
            duration={duration}
          />
        </div>

        <div className="flex items-center gap-1">
          {layoutToggle && (
            <button
              type="button"
              onClick={layoutToggle.onToggle}
              className="h-9 px-3 rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.66)] text-xs text-[#ffffff] whitespace-nowrap"
            >
              {layoutToggle.label}
            </button>
          )}

          {/* 전체화면 버튼 */}
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
    </div>
  );
}
