type ProgressBarProps = {
  value: number; // 0~100
};

export default function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="mt-4 w-full max-w-3xl">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-gray-900 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <p className="mt-2 text-body-s text-gray-500">{value}%</p>
    </div>
  );
}
