export const TABS = [
  { key: 'slide', label: '슬라이드' },
  { key: 'video', label: '영상' },
  { key: 'insight', label: '인사이트' },
] as const;

export type Tab = (typeof TABS)[number]['key'];

export const DEFAULT_TAB: Tab = 'slide';
export const DEFAULT_SLIDE_INDEX = 1;

/** 탭별 경로 생성 */
export const getTabPath = (presentationId: string, tab: Tab, slideIndex?: number): string => {
  switch (tab) {
    case 'slide':
      return `/${presentationId}/slide/${slideIndex ?? DEFAULT_SLIDE_INDEX}`;
    case 'video':
      return `/${presentationId}/video`;
    case 'insight':
      return `/${presentationId}/insight`;
  }
};

/** pathname에서 탭 추출 (/:presentationId/:tab/...) */
export const getTabFromPathname = (pathname: string): Tab => {
  const segments = pathname.split('/').filter(Boolean);
  const tabSegment = segments[1];

  if (tabSegment === 'video') return 'video';
  if (tabSegment === 'insight') return 'insight';
  return 'slide';
};
