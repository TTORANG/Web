/**
 * @file Logo.tsx
 * @description 또랑 로고 컴포넌트
 *
 * 홈에서는 전체 로고, 그 외 페이지에서는 아이콘 로고를 표시합니다.
 * 클릭 시 홈으로 이동합니다. onClick이 제공되면 네비게이션 대신 해당 핸들러를 실행합니다.
 */
import { type DragEvent, type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';

import logoFull from '@/assets/logo-full@4x.webp';
import logoIcon from '@/assets/logo-icon@4x.webp';

interface LogoProps {
  onClick?: () => void;
}

export function Logo({ onClick }: LogoProps) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  const handleClick = (e: MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
  };

  return (
    <Link to="/" onClick={handleClick} onDragStart={handleDragStart} className="select-none">
      <img
        src={isHome ? logoFull : logoIcon}
        alt="또랑"
        className="h-8 select-none"
        draggable={false}
      />
    </Link>
  );
}
