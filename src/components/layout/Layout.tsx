import type { ReactNode } from 'react';

import { Header } from './Header';

interface LayoutProps {
  headerLeft?: ReactNode;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  children?: ReactNode;
}

export function Layout({ headerLeft, headerCenter, headerRight, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header left={headerLeft} center={headerCenter} right={headerRight} />
      <main className="pt-15">{children}</main>
    </div>
  );
}
