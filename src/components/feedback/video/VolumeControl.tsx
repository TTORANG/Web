/**
 * @file VolumeControl.tsx
 * @description 볼륨 컨트롤 + 시간 표시 컴포넌트
 *
 * - 볼륨 아이콘 클릭: 음소거 토글
 * - 호버/포커스 시 우측으로 슬라이더 확장
 * - 시간 표시는 고정 위치 유지
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
  /** 재생 시간 표시 가능 여부 */
  isTimestampReady?: boolean;
}

export default function VolumeControl({
  volume,
  onVolumeChange,
  currentTime,
  duration,
  isTimestampReady = true,
}: VolumeControlProps) {
  const volumePercent = Math.round(volume * 100);
  const currentTimeLabel = isTimestampReady ? formatVideoTimestamp(currentTime) : '--:--';
  const durationLabel = isTimestampReady ? formatVideoTimestamp(duration) : '--:--';

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
    <div className="flex items-center gap-1.5">
      <div className="group/vol flex items-center">
        <div className="flex h-8 w-8 items-center overflow-hidden rounded-full bg-[rgba(18,18,20,0.78)] backdrop-blur-[6px] transition-[width,padding] duration-150 ease-out group-hover/vol:w-[6.25rem] group-hover/vol:pr-2 group-focus-within/vol:w-[6.25rem] group-focus-within/vol:pr-2">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(18,18,20,0.78)] backdrop-blur-[6px] transition-colors duration-150 hover:bg-[rgba(18,18,20,0.88)]"
            aria-label={volume === 0 ? '음소거 해제' : '음소거'}
          >
            <img
              src={volume === 0 ? muteIcon : unmuteIcon}
              alt={volume === 0 ? '음소거 해제' : '음소거'}
              className="h-7 w-7"
            />
          </button>

          <div className="ml-2 flex w-13 items-center opacity-0 transition-opacity duration-100 group-hover/vol:opacity-100 group-focus-within/vol:opacity-100">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              style={volumeTrackStyle}
              className="volume-range block h-0.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFFFFF] [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FFFFFF] [&::-moz-range-thumb]:border-0"
              aria-label="볼륨"
            />
          </div>
        </div>
      </div>

      <div className="whitespace-nowrap rounded-full bg-[rgba(18,18,20,0.78)] px-3 py-2 text-caption tabular-nums text-[#ffffff] backdrop-blur-[6px]">
        <span>{currentTimeLabel}</span>
        <span className="mx-1">/</span>
        <span>{durationLabel}</span>
      </div>
    </div>
  );
}
