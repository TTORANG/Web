import clsx from 'clsx';

interface SpinnerProps {
  /** 스피너 크기 (기본값: 24) */
  size?: number;
  /** 스피너 색상 (기본값: main) */
  color?: string;
  /** 선 두께 (기본값: 2.5) */
  strokeWidth?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 로딩 스피너 컴포넌트
 * @example
 * <Spinner />
 * <Spinner size={32} color="var(--color-main)" />
 */
export function Spinner({
  size = 24,
  color = 'var(--color-main)',
  strokeWidth = 2.5,
  className = '',
}: SpinnerProps) {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      className={clsx('animate-spin', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="로딩 중"
    >
      {/* 배경 트랙 */}
      <circle
        cx="12"
        cy="12"
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-10"
      />
      {/* 회전하는 아크 */}
      <circle
        cx="12"
        cy="12"
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.75}
        className="origin-center"
      />
    </svg>
  );
}
