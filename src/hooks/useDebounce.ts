import { useCallback, useEffect, useRef } from 'react';

/**
 * debounce된 콜백을 반환하는 훅
 *
 * @param callback - 실행할 함수
 * @param delay - 지연 시간 (ms)
 *
 * @example
 * const debouncedSave = useDebouncedCallback((value: string) => {
 *   saveToServer(value);
 * }, 500);
 *
 * // 입력이 멈춘 후 500ms 뒤에 저장
 * onChange={(e) => debouncedSave(e.target.value)}
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // 최신 콜백을 effect에서 업데이트
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}
