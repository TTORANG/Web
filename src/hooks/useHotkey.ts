import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

interface UseHotkeyOptions {
  /** 훅 활성화 여부 (기본값: true) */
  enabled?: boolean;
  /** input, textarea 등에서도 동작할지 여부 (기본값: false) */
  enableOnInput?: boolean;
}

/**
 * 키보드 단축키를 등록하는 훅
 *
 * @example
 * useHotkey({
 *   ArrowUp: () => navigatePrev(),
 *   ArrowDown: () => navigateNext(),
 *   'Ctrl+s': () => save(),
 * });
 */
export function useHotkey(keyMap: KeyMap, options: UseHotkeyOptions = {}) {
  const { enabled = true, enableOnInput = false } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // input, textarea 등에서는 무시 (옵션에 따라)
      if (!enableOnInput) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // 조합키 생성 (Ctrl+Shift+Alt+Key)
      const modifiers: string[] = [];
      if (e.ctrlKey || e.metaKey) modifiers.push('Ctrl');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.altKey) modifiers.push('Alt');

      const key = e.key;
      const combo = [...modifiers, key].join('+');

      // 조합키 먼저 확인, 없으면 단일 키 확인
      const handler = keyMap[combo] ?? keyMap[key];

      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap, enabled, enableOnInput]);
}
