import { useMemo } from 'react';

import type { SortMode } from '@/types/home';
import type { CardItems } from '@/types/project';

export function useSortedProjects(projects: CardItems[], sort: SortMode) {
  return useMemo(() => {
    const next = [...projects];
    if (sort === 'recent') return next;
    if (sort === 'commentCount') {
      return next.sort((a, b) => b.commentCount - a.commentCount);
    }
    if (sort === 'name') {
      return next.sort((a, b) => a.title.localeCompare(b.title));
    }
    return next;
  }, [projects, sort]);
}
