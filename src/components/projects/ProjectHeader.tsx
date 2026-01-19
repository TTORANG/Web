import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';
import FilterIcon from '@/assets/icons/icon-filter.svg?react';
import SearchIcon from '@/assets/icons/icon-search.svg?react';
import ViewCardIcon from '@/assets/icons/icon-view-card.svg?react';
import ViewListIcon from '@/assets/icons/icon-view-list.svg?react';
import type { ProjectHeaderProps } from '@/types/project';

import { Dropdown } from '../common';

// TODO
// - 필터, 정렬 기능 추가
//  ㄴ> onClick에 상태 업데이트 추가

//검색 + 우측 컨트롤
export default function ProjectHeader({
  value,
  onChange,
  viewMode,
  onChangeViewMode,
}: ProjectHeaderProps) {
  const isCard = viewMode === 'card';
  const isList = viewMode === 'list';

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
        <Dropdown
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
          menuClassName="w-32"
          items={[
            { id: 'all', label: '전체', onClick: () => {} },
            { id: '3m', label: '3분 이하', onClick: () => {} },
            { id: '5m', label: '5분 이하', onClick: () => {} },
          ]}
        />

        <div className="h-4 w-px bg-gray-300" />

        <Dropdown
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
          menuClassName="w-36"
          items={[
            { id: 'recent', label: '최신순', onClick: () => {} },
            { id: 'commentCount', label: '피드백 많은 순', onClick: () => {} },
            { id: 'name', label: '가나다순', onClick: () => {} },
          ]}
        />

        {/* 보기 방식 | 카드 or 리스트 */}
        <div className="ml-1 flex items-center">
          <button
            aria-label="카드뷰"
            aria-pressed={isCard}
            className={clsx('rounded-lg p-2', isCard ? 'text-gray-800' : 'text-gray-400')}
            type="button"
            onClick={() => onChangeViewMode('card')}
          >
            <ViewCardIcon className="h-6 w-6" />
          </button>
          <button
            aria-label="리스트뷰"
            aria-pressed={isList}
            className={clsx('rounded-lg p-2', isList ? 'text-gray-800' : 'text-gray-400')}
            type="button"
            onClick={() => onChangeViewMode('list')}
          >
            <ViewListIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
