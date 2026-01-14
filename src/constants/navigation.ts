import type { TabItem, TabKey } from '@/types/navigation';

/** 탭 정의 */
export const TABS: readonly TabItem[] = [
  { key: 'slide', label: '슬라이드' },
  { key: 'video', label: '영상' },
  { key: 'insight', label: '인사이트' },
] as const;

export type Tab = TabKey;

/** 기본 슬라이드 ID */
export const DEFAULT_SLIDE_ID = '1';

const LAST_SLIDE_KEY_PREFIX = 'lastSlideId:';

/**
 * 프로젝트별 마지막으로 본 슬라이드 ID를 로컬 스토리지에 저장합니다.
 * @param projectId - 프로젝트 ID
 * @param slideId - 슬라이드 ID
 */
export const setLastSlideId = (projectId: string, slideId: string): void => {
  try {
    localStorage.setItem(`${LAST_SLIDE_KEY_PREFIX}${projectId}`, slideId);
  } catch {
    // localStorage 사용 불가 시 무시 (프라이빗 모드, 저장 공간 부족 등)
  }
};

/**
 * 프로젝트별 마지막으로 본 슬라이드 ID를 조회합니다.
 * 없으면 기본값(DEFAULT_SLIDE_ID)을 반환합니다.
 * @param projectId - 프로젝트 ID
 */
export const getLastSlideId = (projectId: string): string => {
  try {
    return localStorage.getItem(`${LAST_SLIDE_KEY_PREFIX}${projectId}`) ?? DEFAULT_SLIDE_ID;
  } catch {
    return DEFAULT_SLIDE_ID;
  }
};

/**
 * 탭별 라우팅 경로를 생성합니다.
 * @param projectId - 프로젝트 ID
 * @param tab - 탭 키 (slide, video, insight)
 * @param slideId - (옵션) 슬라이드 탭인 경우 특정 슬라이드 ID
 */
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

export const getPresentationPath = (projectId: string, slideId?: string): string => {
  const targetSlideId = slideId ?? getLastSlideId(projectId);
  return `/${projectId}/fslide/${targetSlideId}`;
};

/**
 * URL 경로에서 현재 활성화된 탭을 추출합니다.
 * @param pathname - 현재 URL 경로
 * @returns 'slide' | 'video' | 'insight'
 */
export const getTabFromPathname = (pathname: string): Tab => {
  const segments = pathname.split('/').filter(Boolean);

  // 프로젝트 경로 형태가 아닌 경우 (예: '/', '/settings' 등)
  if (segments.length < 2) return 'slide';

  const tabSegment = segments[1];

  if (tabSegment === 'video') return 'video';
  if (tabSegment === 'insight') return 'insight';
  return 'slide';
};
