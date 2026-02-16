import { useEffect, useRef, useState } from 'react';

interface VolumeIndicatorProps {
  volume: number;
}

/**
 * @description 마이크 입력 레벨을 막대 형태로 시각화하는 컴포넌트
 *
 * 컨테이너 너비에 따라 막대 수를 자동 조절합니다.
 */
export const VolumeIndicator = ({ volume }: VolumeIndicatorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [barCount, setBarCount] = useState(52);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      // 막대 ~6px + gap 4px = 10px 단위로 개수 산출
      const count = Math.max(10, Math.floor(entry.contentRect.width / 10));
      setBarCount(count);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeBars = Math.floor((volume / 255) * barCount * 2);

  return (
    <div ref={containerRef} className="flex w-full gap-1 items-center h-2">
      {Array.from({ length: barCount }, (_, i) => (
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
