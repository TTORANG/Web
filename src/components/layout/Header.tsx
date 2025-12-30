import type { ReactNode } from 'react';

interface HeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function Header({ left, center, right }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-15 items-center justify-between border-b border-gray-200 bg-white px-18">
      <div className="flex items-center">{left}</div>
      <div className="absolute left-1/2 -translate-x-1/2">{center}</div>
      <div className="flex items-center">{right}</div>
    </header>
  );
}
