import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { HomeStateProps } from '@/types/home';

export const useHomeStore = create<HomeStateProps>()(
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
