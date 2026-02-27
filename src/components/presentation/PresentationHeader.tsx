import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';
import SearchIcon from '@/assets/icons/icon-search.svg?react';
import ViewCardIcon from '@/assets/icons/icon-view-card.svg?react';
import ViewListIcon from '@/assets/icons/icon-view-list.svg?react';
import { FILTER_OPTIONS, SORT_OPTIONS } from '@/constants/home';
import type { FilterMode, SortMode, ViewMode } from '@/types/home';

import { Dropdown } from '../common';

interface PresentationHeaderProps {
  value: string;
  onChange: (value: string) => void;
  sort: SortMode;
  onChangeSort: (sort: SortMode) => void;
  filter: FilterMode;
  onChangeFilter: (filter: FilterMode) => void;
  viewMode: ViewMode;
  onChangeViewMode: (viewMode: ViewMode) => void;
}

export default function PresentationHeader({
  value,
  onChange,
  sort,
  onChangeSort,
  filter,
  onChangeFilter,
  viewMode,
  onChangeViewMode,
}: PresentationHeaderProps) {
  const filterLabel =
    filter === null ? '필터' : (FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? '필터');
  const sortLabel =
    sort === null ? '정렬' : (SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '정렬');

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 검색 부분 */}
      <div className="flex w-full sm:flex-1 sm:min-w-0 sm:max-w-none items-center gap-2 px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 focus-within:border-main transition-colors duration-200">
        <input
          className="w-full bg-transparent text-body-m text-gray-900 placeholder:text-gray-600 focus:outline-none"
          aria-label="발표 검색"
          placeholder="검색어를 입력하세요"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
        />
        <SearchIcon className="h-6 w-6 text-gray-400 shrink-0" />
      </div>

      <div className="flex items-center gap-1.5 sm:ml-4 sm:gap-2 sm:shrink-0">
        {/* 필터 */}
        <Dropdown
          trigger={({ isOpen }) => (
            <button
              type="button"
              className={clsx(
                'flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 cursor-pointer text-body-m-bold whitespace-nowrap transition-colors duration-200',
                isOpen ? 'text-main' : 'text-gray-800',
              )}
            >
              <span>{filterLabel}</span>
              <ArrowDownIcon
                className={clsx(
                  'h-4 w-4 transition-transform duration-300',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
          )}
          position="bottom"
          align="start"
          ariaLabel="필터"
          menuClassName="w-32"
          items={FILTER_OPTIONS.map((o) => ({
            id: o.value,
            label: o.label,
            onClick: () => onChangeFilter(o.value),
          }))}
        />

        <div className="h-4 w-px bg-gray-200" />

        {/* 정렬 */}
        <Dropdown
          trigger={({ isOpen }) => (
            <button
              className={clsx(
                'flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 cursor-pointer text-body-m-bold whitespace-nowrap transition-colors duration-200',
                isOpen ? 'text-main' : 'text-gray-800',
              )}
              type="button"
            >
              <span>{sortLabel}</span>
              <ArrowDownIcon
                className={clsx(
                  'h-4 w-4 transition-transform duration-300',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
          )}
          position="bottom"
          align="start"
          ariaLabel="정렬"
          menuClassName="w-36"
          items={SORT_OPTIONS.map((o) => ({
            id: o.value,
            label: o.label,
            onClick: () => onChangeSort(o.value),
          }))}
        />

        {/* 보기 방식 | 카드 or 리스트 */}
        <div className="flex items-center sm:ml-1">
          <button
            aria-label="카드 보기"
            className={clsx(
              'rounded-lg p-2 cursor-pointer transition-colors duration-200',
              viewMode === 'card' ? 'text-main' : 'text-gray-600',
            )}
            type="button"
            onClick={() => onChangeViewMode('card')}
          >
            <ViewCardIcon className="h-6 w-6" />
          </button>
          <button
            aria-label="리스트 보기"
            className={clsx(
              'rounded-lg p-2 cursor-pointer transition-colors duration-200',
              viewMode === 'list' ? 'text-main' : 'text-gray-600',
            )}
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
