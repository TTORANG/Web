import type { ReactNode } from 'react';

import clsx from 'clsx';

interface HeaderButtonProps {
  text: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
}

/**
 * @description 헤더 우측 슬롯에서 공통으로 사용되는 아이콘+텍스트 버튼 컴포넌트
 */
export function HeaderButton({ text, icon, onClick, className }: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1 text-body-s-bold text-gray-800 cursor-pointer transition-colors hover:text-gray-600',
        className,
      )}
    >
      {text}
      {icon}
    </button>
  );
}
