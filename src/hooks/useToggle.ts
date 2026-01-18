import { useCallback, useState } from 'react';

/**
 * 불리언 상태 토글을 위한 커스텀 훅
 * @param initial - 초기 상태 값 (기본값: false)
 * @returns [value, setValue, toggle, on, off]
 * @example
 * const { value: isOpen, toggle, on, off } = useToggle(false);
 */
export const useToggle = (initial = false) => {
  const [value, setValue] = useState(initial);

  // toggle 함수 동일한 참조 유지.
  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  // pop over 바깥 off 클릭시 닫기 구현
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);

  return { value, setValue, toggle, on, off };
};
