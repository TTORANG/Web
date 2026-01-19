import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { SortMode, ViewMode } from '@/types/home';

interface HomeState {
  query: string;
  viewMode: ViewMode;
  sort: SortMode;
  setQuery: (query: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setSort: (sort: SortMode) => void;
}

export const useHomeStore = create<HomeState>()(
  devtools(
    (set) => ({
      query: '',
      viewMode: 'card',
      sort: 'recent',
      setQuery: (query) => set({ query }, false, 'home/setQuery'),
      setViewMode: (viewMode) => set({ viewMode }, false, 'home/setViewMode'),
      setSort: (sort) => set({ sort }, false, 'home/setSort'),
    }),
    { name: 'HomeStore' },
  ),
);
