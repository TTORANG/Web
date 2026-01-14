import type { ReactNode } from 'react';

import { Logo } from '@/components/common';

interface DarkHeaderProps {
  title: string;
  renderRight?: ReactNode;
}

export const DarkHeader = ({ title, renderRight }: DarkHeaderProps) => {
  return (
    <header className="flex h-15 w-full shrink-0 items-center justify-between border-b border-[#ffffff]/10 bg-[#2a2d34] px-6 md:px-18">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="hidden h-4 w-px bg-[#ffffff]/20 sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[#ffffff]">{title}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#ffffff]/40 cursor-help"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
      </div>
      = <div className="flex items-center">{renderRight}</div>
    </header>
  );
};

export default DarkHeader;
