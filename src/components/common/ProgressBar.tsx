type ProgressBarProps = {
  value: number; // 0~100
};

export default function ProgressBar({ value }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="mt-4 w-full max-w-3xl">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gray-900 transition-all"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      <p className="mt-2 text-body-s text-gray-600">{normalizedValue}%</p>
    </div>
  );
}
