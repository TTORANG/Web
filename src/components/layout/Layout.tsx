import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { Logo } from '@/components/common';

interface LayoutProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function Layout({ left, center, right }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 right-0 left-0 z-50 flex h-15 items-center justify-between border-b border-gray-200 bg-white px-18">
        <div className="flex items-center gap-6">{left ?? <Logo />}</div>
        <div className="absolute left-1/2 -translate-x-1/2">{center}</div>
        <div className="flex items-center gap-8">{right}</div>
      </header>
      <main className="pt-15">
        <Outlet />
      </main>
    </div>
  );
}
