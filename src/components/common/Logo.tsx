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
