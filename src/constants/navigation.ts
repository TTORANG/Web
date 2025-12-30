export const TABS = [
  { key: 'slide', label: '슬라이드' },
  { key: 'video', label: '영상' },
  { key: 'insight', label: '인사이트' },
] as const;

export type Tab = (typeof TABS)[number]['key'];
