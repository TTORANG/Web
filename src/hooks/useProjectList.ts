import { useMemo } from 'react';

import type { SortMode } from '@/types/home';
import type { CardItems } from '@/types/project';

export function useProjectList(projects: CardItems[], query: string, sort: SortMode) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? projects.filter((p) => p.title.toLowerCase().includes(q)) : projects;

    if (sort === 'recent') return filtered;
    if (sort === 'commentCount') {
      return [...filtered].sort((a, b) => b.commentCount - a.commentCount);
    }
    if (sort === 'name') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [projects, query, sort]);
}
