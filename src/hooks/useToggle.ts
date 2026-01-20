import { useCallback, useState } from 'react';

/**
 * 불리언 상태 토글 훅
 *
 * @param initial - 초기 상태 (기본값: false)
 * @returns value, setValue, toggle, on, off
 */
export const useToggle = (initial = false) => {
  const [value, setValue] = useState(initial);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);

  return { value, setValue, toggle, on, off };
};
