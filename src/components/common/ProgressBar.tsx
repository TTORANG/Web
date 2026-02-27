/**
 * @file ProgressBar.tsx
 * @description 퍼센트 프로그레스 바 컴포넌트 (0~100)
 */
type ProgressBarProps = {
  value: number; // 0~100
};

export default function ProgressBar({ value }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="flex w-full items-center gap-3">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${normalizedValue}%`}
      >
        <div
          className="h-full bg-gray-600 transition-all"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      <p className="w-11 shrink-0 text-right text-body-s tabular-nums text-gray-600">
        {normalizedValue}%
      </p>
    </div>
  );
}
