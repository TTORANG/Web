export const TABS = [
  { key: 'slide', label: '슬라이드', path: '/slide' },
  { key: 'video', label: '영상', path: '/video' },
  { key: 'insight', label: '인사이트', path: '/insight' },
] as const;

export const PATH_TO_TAB: Record<string, Tab> = {
  '/': 'slide',
  ...Object.fromEntries(TABS.map((tab) => [tab.path, tab.key])),
};

export type Tab = (typeof TABS)[number]['key'];
