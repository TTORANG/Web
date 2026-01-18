interface VolumeIndicatorProps {
  volume: number;
}

/**
 * @description 마이크 입력 레벨을 점 형태로 시각화하는 컴포넌트
 */
export const VolumeIndicator = ({ volume }: VolumeIndicatorProps) => {
  const TOTAL_DOTS = 40;
  const activeDots = Math.floor((volume / 255) * TOTAL_DOTS * 2); // 볼륨 범위 조정

  return (
    <div className="flex gap-1 items-center h-4">
      {[...Array(TOTAL_DOTS)].map((_, i) => (
        <div
          key={i}
          className={`w-1 h-1 rounded-full transition-colors duration-75 ${
            i < activeDots ? 'bg-main' : 'bg-gray-400'
          }`}
        />
      ))}
    </div>
  );
};
