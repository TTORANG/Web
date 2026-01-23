/**
 * @file VideoPlaybackBar.tsx
 * @description (FD_VID_01 - 4/5) 재생바 + 조작 섹션 컴포넌트
 *
 * - 실제 플레이어는 부모의 videoRef(<video>)
 * - store.currentTime으로 UI를 그리고, 클릭/드래그로 videoRef를 seek
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import muteIcon from '@/assets/playbackBar-icons/mute-icon.webp';
import pauseIcon from '@/assets/playbackBar-icons/pause-icon.webp';
import playIcon from '@/assets/playbackBar-icons/play-icon.webp';
import fullscreenIcon from '@/assets/playbackBar-icons/sizeupdown-icon.webp';
import unmuteIcon from '@/assets/playbackBar-icons/unmute-icon.webp';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import { formatVideoTimestamp } from '@/utils/format';

type VideoPlaybackBarProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  /** duration이 아직 없으면 0 가능 */
  duration: number;
  /** 전체화면 대상 컨테이너 (없으면 stage root를 찾아서 사용) */
  fullscreenTargetRef?: React.RefObject<HTMLElement>;
};

export default function VideoPlaybackBar({
  videoRef,
  duration,
  fullscreenTargetRef,
}: VideoPlaybackBarProps) {
  // ===== store (UI 기준 시간) =====
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);

  // ===== local UI state =====
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  // ===== refs (DOM / calc) =====
  const progressBarRef = useRef<HTMLDivElement>(null);

  // ===== derived values =====
  const max = useMemo(() => Math.max(duration, 0), [duration]);
  const progressPercentage = max > 0 ? (currentTime / max) * 100 : 0;

  // 볼륨 슬라이더 채움 스타일
  const volumePercent = Math.round(volume * 100);
  const volumeTrackStyle: React.CSSProperties = {
    background: `linear-gradient(to right, #3b82f6 ${volumePercent}%, rgba(55,65,81,0.9) ${volumePercent}%)`,
  };

  // ===== scrubbing / tooltip =====
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null); // 0~1
  const [isHoveringBar, setIsHoveringBar] = useState(false);

  // ===== video event sync (play/pause, initial state) =====
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

  // ===== core actions =====
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

  // video + store 시간을 같이 맞추는 "단일 진입점"
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

  // ===== progress click =====
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !max) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    const t = p * max;

    scrubTo(Math.max(0, Math.min(t, max)));
  };

  // ===== youtube-like scrubbing + hover tooltip =====
  const getPercentFromClientX = (clientX: number) => {
    const bar = progressBarRef.current;
    if (!bar || !max) return 0;

    const rect = bar.getBoundingClientRect();
    const raw = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(raw, 1));
  };

  const onBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = getPercentFromClientX(e.clientX);
    setHoverX(p);

    if (isScrubbing) scrubTo(p * max);
  };

  const onBarMouseEnter = () => setIsHoveringBar(true);

  const onBarMouseLeave = () => {
    setIsHoveringBar(false);
    setHoverX(null);
  };

  const onBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsScrubbing(true);

    const p = getPercentFromClientX(e.clientX);
    scrubTo(p * max);
  };

  // 바 밖에서 mouseup 해도 드래그 종료
  useEffect(() => {
    const onUp = () => setIsScrubbing(false);
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 재생바 */}
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        onMouseMove={onBarMouseMove}
        onMouseEnter={onBarMouseEnter}
        onMouseLeave={onBarMouseLeave}
        onMouseDown={onBarMouseDown}
        className="relative w-full h-1 hover:h-1.5 bg-gray-700/70 rounded-full cursor-pointer transition-all duration-150 ring-0 hover:ring-2 hover:ring-blue-500/30 group select-none"
      >
        {/* 진행률 */}
        <div
          className="absolute h-full bg-blue-600 rounded-full transition-all duration-150"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* 현재 재생 위치 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow transition-all duration-150 group-hover:w-4 group-hover:h-4"
          style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
        />

        {/* hover 툴팁 */}
        {isHoveringBar && hoverX !== null && (
          <div
            className="absolute -top-8 px-2 py-1 text-[11px] text-white bg-[rgba(26,26,26,0.82)] rounded-md tabular-nums whitespace-nowrap pointer-events-none border border-white/10"
            style={{ left: `${hoverX * 100}%`, transform: 'translateX(-50%)' }}
          >
            {formatVideoTimestamp(hoverX * max)}
          </div>
        )}
      </div>

      {/* 조작 섹션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 재생/일시정지 */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center"
            aria-label={isPlaying ? '일시정지' : '재생'}
          >
            <img
              src={isPlaying ? pauseIcon : playIcon}
              alt={isPlaying ? '일시정지' : '재생'}
              className="w-7 h-7"
            />
          </button>

          {/* 볼륨 */}
          <div className="flex items-center gap-2 group/vol">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center"
              onClick={() => changeVolume(volume === 0 ? 1 : 0)}
              aria-label="음소거"
            >
              <img
                src={volume === 0 ? muteIcon : unmuteIcon}
                alt={volume === 0 ? '음소거 해제' : '음소거'}
                className="w-7 h-7"
              />
            </button>

            {/* hover 시 펼쳐지는 슬라이더 */}
            <div className="flex items-center overflow-hidden w-0 opacity-0 group-hover/vol:w-24 group-hover/vol:opacity-100 transition-all duration-200">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                style={volumeTrackStyle}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                aria-label="볼륨"
              />
            </div>

            {/* 시간 표시 */}
            <div className="ml-1 px-3 py-2 rounded-full text-xs font-medium tabular-nums whitespace-nowrap leading-none bg-[rgba(26,26,26,0.66)] border border-white/10 !text-white">
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
          className="flex h-8 w-8 items-center justify-center"
          aria-label="전체화면"
        >
          <img src={fullscreenIcon} alt="전체화면" className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
