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
  try {
    localStorage.setItem(`${LAST_SLIDE_KEY_PREFIX}${projectId}`, slideId);
  } catch {
    // localStorage 사용 불가 시 무시 (프라이빗 모드, 저장 공간 부족 등)
  }
};

/** 마지막으로 본 슬라이드 ID 조회 */
export const getLastSlideId = (projectId: string): string => {
  try {
    return localStorage.getItem(`${LAST_SLIDE_KEY_PREFIX}${projectId}`) ?? DEFAULT_SLIDE_ID;
  } catch {
    return DEFAULT_SLIDE_ID;
  }
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

  // 프로젝트 경로 형태가 아닌 경우 (예: '/', '/settings' 등)
  if (segments.length < 2) return 'slide';

  const tabSegment = segments[1];

  if (tabSegment === 'video') return 'video';
  if (tabSegment === 'insight') return 'insight';
  return 'slide';
};
