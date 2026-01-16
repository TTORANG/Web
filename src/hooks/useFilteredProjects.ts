import { useMemo } from 'react';

import type { CardItems } from '@/types/project';

export function useFilteredProjects(projects: CardItems[], query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, query]);
}
