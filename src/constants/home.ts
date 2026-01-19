import type { SortMode, ViewMode } from '@/types/home';

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'recent', label: '최신순' },
  { value: 'commentCount', label: '피드백 많은 순' },
  { value: 'name', label: '가나다순' },
];

export const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'card', label: '카드' },
  { value: 'list', label: '리스트' },
];
