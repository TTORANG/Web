import type { ReactNode } from 'react';

import { Logo } from '@/components/common';

interface DarkHeaderProps {
  title: string;
  renderRight?: ReactNode;
}

export const DarkHeader = ({ title, renderRight }: DarkHeaderProps) => {
  return (
    <header className="flex h-15 w-full shrink-0 items-center justify-between border-b border-white/10 bg-[#2a2d34] px-6 md:px-18">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="hidden h-4 w-[1px] bg-white/20 sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-white">{title}</span>
          <img
            src="/assets/icon/icon-information.svg"
            alt="information"
            className="w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center">{renderRight}</div>
    </header>
  );
};

export default DarkHeader;
