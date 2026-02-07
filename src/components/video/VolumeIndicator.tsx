interface VolumeIndicatorProps {
  volume: number;
}

/**
 * @description 마이크 입력 레벨을 막대 형태로 시각화하는 컴포넌트
 */
export const VolumeIndicator = ({ volume }: VolumeIndicatorProps) => {
  const TOTAL_BARS = 52;
  const activeBars = Math.floor((volume / 255) * TOTAL_BARS * 2);

  return (
    <div className="flex w-full gap-1 items-center h-2">
      {[...Array(TOTAL_BARS)].map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-full rounded-full transition-colors duration-75 ${
            i < activeBars ? 'bg-main' : 'bg-gray-600'
          }`}
        />
      ))}
    </div>
  );
};
