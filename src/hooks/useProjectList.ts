import { useMemo } from 'react';

import type { SortMode } from '@/types/home';
import type { ProjectItem } from '@/types/project';

type Options = {
  query?: string;
  sort?: SortMode;
  // 필터 조건이 확정되기 전까지는 predicate 형태로 열어두면
  // UI/요구사항이 바뀌어도 훅은 그대로 재사용 가능...
  filterFn?: (project: ProjectItem) => boolean;
};
export function useProjectList(projects: ProjectItem[], options?: Options) {
  return useMemo(() => {
    const query = options?.query ?? '';
    const sort = options?.sort ?? 'recent';
    const filterFn = options?.filterFn;

    // 1) filter
    let result = filterFn ? projects.filter(filterFn) : projects;

    // 2) search
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

    // 3) sort
    if (sort === 'recent') return result;

    const next = [...result];
    if (sort === 'commentCount') {
      return next.sort((a, b) => b.commentCount - a.commentCount);
    }
    if (sort === 'name') {
      return next.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [projects, options?.query, options?.sort, options?.filterFn]);
}
