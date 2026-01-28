import RingIcon from '@/assets/icons/icon-ring.svg?react';

interface DonutChartProps {
  percent: number;
}

export default function DonutChart({ percent }: DonutChartProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <RingIcon className="w-full h-full text-gray-100" aria-hidden="true" />
      <svg
        className="absolute inset-0 transform -rotate-90 w-full h-full"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#EF4444"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold text-red-500">{percent}%</span>
    </div>
  );
}
