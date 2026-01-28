/**
 * @file VolumeControl.tsx
 * @description 볼륨 컨트롤 + 시간 표시 컴포넌트
 *
 * - 볼륨 아이콘 클릭: 음소거 토글
 * - 호버 시 슬라이더 펼쳐짐
 * - 시간 표시가 오른쪽으로 슬라이드
 */
import muteIcon from '@/assets/playbackBar-icons/mute-icon.webp';
import unmuteIcon from '@/assets/playbackBar-icons/unmute-icon.webp';
import { formatVideoTimestamp } from '@/utils/format';

interface VolumeControlProps {
  /** 현재 볼륨 (0~1) */
  volume: number;
  /** 볼륨 변경 콜백 */
  onVolumeChange: (volume: number) => void;
  /** 현재 재생 시간 (초) */
  currentTime: number;
  /** 비디오 총 길이 (초) */
  duration: number;
}

export default function VolumeControl({
  volume,
  onVolumeChange,
  currentTime,
  duration,
}: VolumeControlProps) {
  const volumePercent = Math.round(volume * 100);

  const volumeTrackStyle: React.CSSProperties = {
    background: `linear-gradient(
      to right,
      #FFFFFF ${volumePercent}%,
      rgba(255,255,255,0.3) ${volumePercent}%
    )`,
  };

  const toggleMute = () => {
    onVolumeChange(volume === 0 ? 1 : 0);
  };

  return (
    <div className="group/vol relative flex items-center gap-1">
      {/* 볼륨 아이콘 - pill 위에 보이도록 z-10 */}
      <button
        type="button"
        onClick={toggleMute}
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.66)]"
        aria-label={volume === 0 ? '음소거 해제' : '음소거'}
      >
        <img
          src={volume === 0 ? muteIcon : unmuteIcon}
          alt={volume === 0 ? '음소거 해제' : '음소거'}
          className="h-7 w-7"
        />
      </button>

      {/* pill: 기본은 숨김 -> hover 시 나타남 */}
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/vol:opacity-100 transition-opacity duration-150">
        <div className="flex items-center gap-1 rounded-full bg-[#000000]/45 px-3 h-8">
          {/* 아이콘 자리 (왼쪽에 실제 아이콘이 있으므로 빈공간) */}
          <div className="h-7 w-5 shrink-0" />

          {/* 볼륨 슬라이더 */}
          <div className="w-13 pointer-events-auto flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              style={volumeTrackStyle}
              className="volume-range block w-full h-0.5 cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFFFFF] [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FFFFFF] [&::-moz-range-thumb]:border-0"
              aria-label="볼륨"
            />
          </div>
        </div>
      </div>

      {/* 시간 표시 - hover 시 오른쪽으로 슬라이드 */}
      <div className="whitespace-nowrap rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.66)] px-3 py-2 text-xs font-medium tabular-nums text-[#ffffff] transition-all duration-150 group-hover/vol:translate-x-19">
        <span>{formatVideoTimestamp(currentTime)}</span>
        <span className="mx-1">/</span>
        <span>{formatVideoTimestamp(duration)}</span>
      </div>
    </div>
  );
}
