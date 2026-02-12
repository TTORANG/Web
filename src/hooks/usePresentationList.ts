import { useMemo } from 'react';

import type { SortMode } from '@/types/home';
import type { Presentation } from '@/types/presentation';
import { normalizeForSearch } from '@/utils/normalizeForSearch';

type Options = {
  query?: string;
  sort?: SortMode;
  filterFn?: (presentation: Presentation) => boolean;
};

/**
 * 프로젝트 목록 필터/정렬 훅
 *
 * 검색, 정렬, 커스텀 필터를 적용한 프로젝트 목록을 반환합니다.
 *
 * @param presentations - 원본 프로젝트 배열
 * @param options.query - 검색어 (제목 기준)
 * @param options.sort - 정렬 모드 ('recent' | 'commentCount' | 'name')
 * @param options.filterFn - 커스텀 필터 함수
 * @returns 필터링/정렬된 프로젝트 배열
 */
export function usePresentationList(presentations: Presentation[], options?: Options) {
  const query = options?.query ?? '';
  const sort = options?.sort ?? 'recent';
  const filterFn = options?.filterFn;

  return useMemo(() => {
    let result = filterFn ? presentations.filter(filterFn) : presentations;

    const q = normalizeForSearch(query);
    if (q) {
      result = result.filter((p) => {
        const t = normalizeForSearch(p.title);
        return t.includes(q);
      });
    }

    if (sort === 'recent') return result;

    const next = [...result];
    if (sort === 'commentCount') return next.sort((a, b) => b.feedbackCount - a.feedbackCount);
    if (sort === 'name') return next.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [presentations, query, sort, filterFn]);
}
