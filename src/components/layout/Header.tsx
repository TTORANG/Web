import type { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-15 items-center justify-center border-b border-gray-200 bg-white px-18">
      {children}
    </header>
  );
}
