export const TABS = [
  { key: 'slide', label: '슬라이드' },
  { key: 'video', label: '영상' },
  { key: 'insight', label: '인사이트' },
] as const;

export type Tab = (typeof TABS)[number]['key'];

export const DEFAULT_SLIDE_ID = '1';

/** 탭별 경로 생성 */
export const getTabPath = (projectId: string, tab: Tab, slideId?: string): string => {
  switch (tab) {
    case 'slide':
      return `/${projectId}/slide/${slideId ?? DEFAULT_SLIDE_ID}`;
    case 'video':
      return `/${projectId}/video`;
    case 'insight':
      return `/${projectId}/insight`;
  }
};

/** pathname에서 탭 추출 (/:projectId/:tab/...) */
export const getTabFromPathname = (pathname: string): Tab => {
  const segments = pathname.split('/').filter(Boolean);
  const tabSegment = segments[1];

  if (tabSegment === 'video') return 'video';
  if (tabSegment === 'insight') return 'insight';
  return 'slide';
};
