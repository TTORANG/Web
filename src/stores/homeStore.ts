/**
 * 홈 화면 UI 상태 관리 스토어
 *
 * 프로젝트 검색, 정렬, 보기 모드를 관리합니다.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { FilterMode, SortMode, ViewMode } from '@/types/home';

interface HomeState {
  query: string;
  viewMode: ViewMode;
  sort: SortMode;
  filter: FilterMode;
  setQuery: (query: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setSort: (sort: SortMode) => void;
  setFilter: (filter: FilterMode) => void;
}

export const useHomeStore = create<HomeState>()(
  devtools(
    (set) => ({
      query: '',
      viewMode: 'card',
      sort: null,
      filter: null,
      setQuery: (query) => set({ query }, false, 'home/setQuery'),
      setViewMode: (viewMode) => set({ viewMode }, false, 'home/setViewMode'),
      setSort: (sort) => set({ sort }, false, 'home/setSort'),
      setFilter: (filter) => set({ filter }, false, 'home/setFilter'),
    }),
    { name: 'HomeStore' },
  ),
);
