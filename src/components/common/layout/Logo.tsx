/**
 * @file Logo.tsx
 * @description 또랑 로고 컴포넌트
 *
 * 홈에서는 전체 로고, 그 외 페이지에서는 아이콘 로고를 표시합니다.
 * 클릭 시 홈으로 이동합니다.
 */
import { Link, useLocation } from 'react-router-dom';

import logoFull from '@/assets/logo-full@4x.webp';
import logoIcon from '@/assets/logo-icon@4x.webp';

export function Logo() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <Link to="/">
      <img src={isHome ? logoFull : logoIcon} alt="또랑" className="h-8" />
    </Link>
  );
}
