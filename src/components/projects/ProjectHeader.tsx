import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';
import FilterIcon from '@/assets/icons/icon-filter.svg?react';
import SearchIcon from '@/assets/icons/icon-search.svg?react';
import ViewCardIcon from '@/assets/icons/icon-view-card.svg?react';
import ViewListIcon from '@/assets/icons/icon-view-list.svg?react';
import type { ProjectHeaderProps } from '@/types/project';

import { Popover } from '../common';

// TODO
// - 필터, 정렬 기능 추가

//검색 + 우측 컨트롤
export default function ProjectHeader({ value, onChange }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 검색 부분 */}
      <div className="flex w-full max-w-xl items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg bg-white">
        <input
          className="w-full bg-transparent text-body-m text-gray-900 placeholder:text-gray-500 focus:outline-none"
          placeholder="검색어를 입력하세요"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <SearchIcon className="h-6 w-6 text-gray-500" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* 필터 및 정렬 */}
        <Popover
          trigger={({ isOpen }) => (
            <button
              type="button"
              className={clsx(
                'flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer text-body-m-bold',
                isOpen ? 'text-main' : 'text-gray-700',
              )}
            >
              <span>필터</span>
              <FilterIcon className="h-5 w-5" />
            </button>
          )}
          position="bottom"
          align="start"
          ariaLabel="필터"
          className="border border-gray-200 w-32 overflow-hidden"
        >
          <div className="text-sm">
            <button className="w-full px-3 py-2 text-left hover:bg-gray-100" type="button">
              전체
            </button>
            <button className="w-full px-3 py-2 text-left hover:bg-gray-100" type="button">
              3분 이하
            </button>
            <button className="w-full px-3 py-2 text-left hover:bg-gray-100" type="button">
              5분 이하
            </button>
          </div>
        </Popover>

        <div className="h-4 w-px bg-gray-300" />
        <Popover
          trigger={({ isOpen }) => (
            <button
              className={clsx(
                'flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer text-body-m-bold',
                isOpen ? 'text-main' : 'text-gray-700',
              )}
              type="button"
            >
              <span>정렬</span>
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          )}
          position="bottom"
          align="start"
          ariaLabel="정렬"
          className="border border-gray-200 w-36 overflow-hidden"
        >
          <div className="text-sm">
            <button className="w-full px-3 py-2 text-left hover:bg-gray-100" type="button">
              최신순
            </button>
            <button className="w-full px-3 py-2 text-left hover:bg-gray-100" type="button">
              피드백 많은 순
            </button>
            <button className="w-full px-3 py-2 text-left hover:bg-gray-100" type="button">
              가나다순
            </button>
          </div>
        </Popover>

        {/* 보기 방식 | 카드 or 리스트 */}
        <div className="ml-1 flex items-center">
          <button aria-label="카드 보기" className="rounded-lg p-2 cursor-pointer" type="button">
            <ViewCardIcon className="h-6 w-6" />
          </button>
          <button aria-label="리스트 보기" className="rounded-lg p-2 cursor-pointer" type="button">
            <ViewListIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
