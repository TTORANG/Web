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
      className={clsx(
        'flex items-center gap-1 text-body-s-bold text-gray-800 cursor-pointer transition-colors hover:text-gray-600',
        shouldHideTextOnMobile && 'justify-center',
        className,
      )}
    >
      <span className={clsx(shouldHideTextOnMobile && 'hidden lg:inline')}>{text}</span>
      {icon}
    </button>
  );
}
