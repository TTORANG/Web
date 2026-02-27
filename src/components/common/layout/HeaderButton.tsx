/**
 * @file HeaderButton.tsx
 * @description 헤더 우측 영역 아이콘+텍스트 버튼
 */
import type { ReactNode } from 'react';

import clsx from 'clsx';

interface HeaderButtonProps {
  text: string;
  icon?: ReactNode;
  onClick: () => void;
  className?: string;
  iconOnlyOnMobile?: boolean;
}

/**
 * @description 헤더 우측 슬롯에서 공통으로 사용되는 아이콘+텍스트 버튼 컴포넌트
 */
export function HeaderButton({
  text,
  icon,
  onClick,
  className,
  iconOnlyOnMobile = false,
}: HeaderButtonProps) {
  const shouldHideTextOnMobile = iconOnlyOnMobile && !!icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={shouldHideTextOnMobile ? text : undefined}
      className={clsx(
        'flex min-h-11 min-w-11 items-center gap-1 rounded-md px-2 py-2 text-body-s-bold text-gray-800 transition-colors hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-main focus-visible:outline-offset-2',
        shouldHideTextOnMobile && 'justify-center',
        className,
      )}
    >
      <span
        aria-hidden={shouldHideTextOnMobile}
        className={clsx(shouldHideTextOnMobile && 'hidden lg:inline')}
      >
        {text}
      </span>
      {icon}
    </button>
  );
}
