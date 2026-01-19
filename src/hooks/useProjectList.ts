/**
 * 프로젝트 목록 필터/정렬 훅
 *
 * 검색, 정렬, 커스텀 필터를 적용한 프로젝트 목록을 반환합니다.
 *
 * @param projects - 원본 프로젝트 배열
 * @param options.query - 검색어 (제목 기준)
 * @param options.sort - 정렬 모드 ('recent' | 'commentCount' | 'name')
 * @param options.filterFn - 커스텀 필터 함수
 * @returns 필터링/정렬된 프로젝트 배열
 */
import { useMemo } from 'react';

import type { SortMode } from '@/types/home';
import type { Project } from '@/types/project';

type Options = {
  query?: string;
  sort?: SortMode;
  filterFn?: (project: Project) => boolean;
};

export function useProjectList(projects: Project[], options?: Options) {
  return useMemo(() => {
    const query = options?.query ?? '';
    const sort = options?.sort ?? 'recent';
    const filterFn = options?.filterFn;

    let result = filterFn ? projects.filter(filterFn) : projects;

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

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
