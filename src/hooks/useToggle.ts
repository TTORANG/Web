import { useCallback, useState } from 'react';

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
