/**
 * 홈 스토어 셀렉터 훅
 *
 * 필요한 상태만 구독하여 불필요한 리렌더링을 방지합니다.
 */
import { useShallow } from 'zustand/shallow';

import { useHomeStore } from '@/stores/homeStore';

/** 검색어 구독 */
export const useHomeQuery = () => useHomeStore((s) => s.query);

/** 보기 모드 구독 ('card' | 'list') */
export const useHomeViewMode = () => useHomeStore((s) => s.viewMode);

/** 정렬 모드 구독 ('recent' | 'commentCount' | 'name') */
export const useHomeSort = () => useHomeStore((s) => s.sort);

/** 필터 모드 구독 ('all' | '3m' | '5m') */
export const useHomeFilter = () => useHomeStore((s) => s.filter);

/** 홈 스토어 액션들 (참조 안정적) */
export const useHomeActions = () =>
  useHomeStore(
    useShallow((s) => ({
      setQuery: s.setQuery,
      setViewMode: s.setViewMode,
      setSort: s.setSort,
      setFilter: s.setFilter,
    })),
  );
