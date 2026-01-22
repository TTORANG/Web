/**
 * @file VideoPlaybackBar.tsx
 * @description (FD_VID_01 - 4/5) 재생바 + 조작 섹션 컴포넌트
 *
 * - 진짜 플레이어는 부모가 가진 videoRef (웹캠 녹화본)
 * - store.currentTime을 보여주고, 드래그하면 videoRef를 seek
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import muteIcon from '@/assets/playbackBar-icons/mute-icon.webp';
// 아이콘 import
import pauseIcon from '@/assets/playbackBar-icons/pause-icon.webp';
import playIcon from '@/assets/playbackBar-icons/play-icon.webp';
import fullscreenIcon from '@/assets/playbackBar-icons/sizeupdown-icon.webp';
import unmuteIcon from '@/assets/playbackBar-icons/unmute-icon.webp';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
  /** duration이 아직 없으면 0 가능 */
  duration: number;
  /** 전체화면 대상 컨테이너 (슬라이드+웹캠 유지 위해 Stage root를 넣는 걸 권장) */
  fullscreenTargetRef?: React.RefObject<HTMLElement>;
};

function formatTime(seconds: number) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;

  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

export default function VideoPlaybackBar({ videoRef, duration, fullscreenTargetRef }: Props) {
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const max = useMemo(() => Math.max(duration, 0), [duration]);
  const progressPercentage = max > 0 ? (currentTime / max) * 100 : 0;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);

    // 초기 상태 반영
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
        // autoplay 정책 등으로 실패 가능
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !max) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * max;
    scrubTo(Math.max(0, Math.min(newTime, max)));
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

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 4a: 재생바 */}
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        className="
    relative w-full
    h-1 hover:h-1.5
    bg-gray-700/70
    rounded-full cursor-pointer
    transition-all duration-150
    ring-0 hover:ring-2
    group
  "
      >
        {/* 파란색 진행률 */}
        <div
          className="absolute h-full bg-blue-700 rounded-full transition-all duration-150"
          style={{ width: `${progressPercentage}%` }}
        />
        {/* 재생 위치 동그라미 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
          style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
        />
      </div>

      {/* 5: 조작 섹션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 5a: 재생/일시정지 */}
          <button
            type="button"
            onClick={togglePlay}
            className="h-8 w-8  flex items-center justify-center"
            aria-label={isPlaying ? '일시정지' : '재생'}
          >
            <img
              src={isPlaying ? pauseIcon : playIcon}
              alt={isPlaying ? '일시정지' : '재생'}
              className="w-7 h-7"
            />
          </button>

          {/* 5b: 볼륨 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 w-8  flex items-center justify-center"
              onClick={() => changeVolume(volume === 0 ? 1 : 0)}
              aria-label="음소거"
            >
              <img
                src={volume === 0 ? muteIcon : unmuteIcon}
                alt={volume === 0 ? '음소거 해제' : '음소거'}
                className="w-7 h-7"
              />
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-16 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
              aria-label="볼륨"
            />

            {/* 5c: 시간 표시 - unmute 아이콘 옆 */}
            <div className="bg-[rgba(26,26,26,0.66)] flex items-center text-white! gap-1 px-4 py-2 rounded-full text-xs tabular-nums whitespace-nowrap leading-none font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(max)}</span>
            </div>
          </div>
        </div>

        {/* 5d: 전체화면 */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="h-8 w-8 flex items-center justify-center"
          aria-label="전체화면"
        >
          <img src={fullscreenIcon} alt="전체화면" className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
