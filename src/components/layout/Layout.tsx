import type { ReactNode } from 'react';

interface LayoutProps {
  logo?: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function Layout({ logo, nav, actions, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-15 items-center justify-between border-b border-gray-200 bg-white px-18">
        <div className="flex items-center">{logo}</div>
        <div className="absolute left-1/2 -translate-x-1/2">{nav}</div>
        <div className="flex items-center">{actions}</div>
      </header>
      <main className="pt-15">{children}</main>
    </div>
  );
}
