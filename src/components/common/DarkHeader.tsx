import type { ReactNode } from 'react';

import clsx from 'clsx';

import Informaion from '@/assets/icons/icon-info.svg?react';
import { Logo, Popover } from '@/components/common';

interface DarkHeaderProps {
  title: string;
  renderRight?: ReactNode;
  publisher?: string;
  publishedAt?: string;
}

export const DarkHeader = ({
  title,
  renderRight,
  publisher = '익명의 바다거북이',
  publishedAt = '2025.11.25 21:10:34',
}: DarkHeaderProps) => {
  return (
    <header className="flex h-15 w-full shrink-0 items-center justify-between border-b border-gray-600 bg-gray-800 px-6 md:px-18">
      <div className="flex items-center gap-4">
        <Logo />

        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-white">{title}</span>

          <Popover
            trigger={({ isOpen }) => (
              <button
                type="button"
                className={clsx(
                  'flex items-center justify-center transition-colors',
                  // 열려있거나 호버시 흰색, 평소엔 회색
                  isOpen ? 'text-white' : 'text-gray-200 hover:text-white',
                )}
              >
                <Informaion className="h-4 w-4 translate-y-[1px]" />
              </button>
            )}
            align="end" // 팝오버 왼쪽 정렬 (취향에 따라 center로 변경 가능)
            position="bottom"
            className="w-[250px] max-w-[calc(100vw-2rem)] rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5 left-1/2 right-auto -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0"
          >
            {/* 팝오버 내부 콘텐츠 (사진 디자인 반영) */}
            <div className="flex flex-col gap-2">
              {/* 행 1: 게시자 */}
              <div className="flex items-center gap-4">
                <span className="w-14 text-body-s-bold text-gray-600">게시자</span>
                <span className="text-body-s text-gray-800">{publisher}</span>
              </div>

              {/* 행 2: 게시 날짜 */}
              <div className="flex items-center gap-4">
                <span className="w-14 text-body-s-bold text-gray-600">게시 날짜</span>
                <span className="text-body-s text-gray-800">{publishedAt}</span>
              </div>
            </div>
          </Popover>
        </div>
      </div>
      <div className="flex items-center">{renderRight}</div>
    </header>
  );
};

export default DarkHeader;
