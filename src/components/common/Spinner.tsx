interface SpinnerProps {
  /** 스피너 크기 (기본값: 24) */
  size?: number;
  /** 스피너 색상 (기본값: currentColor) */
  color?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 로딩 스피너 컴포넌트
 * @example
 * <Spinner />
 * <Spinner size={32} color="var(--color-main)" />
 */
export function Spinner({ size = 24, color = 'currentColor', className = '' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="로딩 중"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="3" />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
