import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface SocialLoginButtonProps extends ComponentPropsWithoutRef<'button'> {
  leftIcon?: ReactNode;
  label: string;
  className?: string;
}

export default function SocialLoginButton({
  leftIcon,
  label,
  className = '',
  ...props
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      className={['relative flex h-12 w-full items-center rounded-lg px-4', className].join(' ')}
      {...props}
    >
      {/* 왼쪽 아이콘 */}
      {leftIcon && <span className="absolute left-4 flex items-center">{leftIcon}</span>}

      {/* 가운데 텍스트 */}
      <span className="absolute inset-0 flex items-center justify-center text-body-s">{label}</span>
    </button>
  );
}
