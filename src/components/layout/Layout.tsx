import type { ReactNode } from 'react';

import { Header } from './Header';

interface LayoutProps {
  header: ReactNode;
  children?: ReactNode;
}

export function Layout({ children, header }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header>{header}</Header>
      <main className="pt-15">{children}</main>
    </div>
  );
}
