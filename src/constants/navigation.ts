export const TABS = [
  { key: 'slide', label: '슬라이드' },
  { key: 'video', label: '영상' },
  { key: 'insight', label: '인사이트' },
] as const;

export type Tab = (typeof TABS)[number]['key'];

export const DEFAULT_SLIDE_ID = '1';

const LAST_SLIDE_KEY_PREFIX = 'lastSlideId:';

/** 마지막으로 본 슬라이드 ID 저장 */
export const setLastSlideId = (projectId: string, slideId: string): void => {
  localStorage.setItem(`${LAST_SLIDE_KEY_PREFIX}${projectId}`, slideId);
};

/** 마지막으로 본 슬라이드 ID 조회 */
export const getLastSlideId = (projectId: string): string => {
  return localStorage.getItem(`${LAST_SLIDE_KEY_PREFIX}${projectId}`) ?? DEFAULT_SLIDE_ID;
};

/** 탭별 경로 생성 */
export const getTabPath = (projectId: string, tab: Tab, slideId?: string): string => {
  switch (tab) {
    case 'slide':
      return `/${projectId}/slide/${slideId ?? getLastSlideId(projectId)}`;
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
