import type { FilterMode, SortMode, ViewMode } from '@/types/home';

export const FILTER_OPTIONS: { value: Exclude<FilterMode, null>; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: '3m', label: '3분 이하' },
  { value: '5m', label: '5분 이하' },
];

export const SORT_OPTIONS: { value: Exclude<SortMode, null>; label: string }[] = [
  { value: 'recent', label: '최신순' },
  { value: 'commentCount', label: '피드백 많은 순' },
  { value: 'name', label: '가나다순' },
];

export const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'card', label: '카드' },
  { value: 'list', label: '리스트' },
];
