import { useCallback, useSyncExternalStore } from 'react';

/**
 * CSS 미디어 쿼리를 감지하는 훅
 * @param query 미디어 쿼리 문자열 (예: '(min-width: 768px)')
 * @returns 미디어 쿼리 일치 여부
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', callback);
      return () => mediaQueryList.removeEventListener('change', callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Tailwind CSS md 브레이크포인트(768px 이상) 감지 훅
 * @returns 데스크톱 뷰 여부
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
