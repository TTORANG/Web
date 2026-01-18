import { useShallow } from 'zustand/shallow';

import { useHomeStore } from '@/stores/homeStore';

export const useHomeQuery = () => useHomeStore((s) => s.query);
export const useHomeViewMode = () => useHomeStore((s) => s.viewMode);
export const useHomeSort = () => useHomeStore((s) => s.sort);

export const useHomeActions = () =>
  useHomeStore(
    useShallow((s) => ({
      setQuery: s.setQuery,
      setViewMode: s.setViewMode,
      setSort: s.setSort,
    })),
  );
