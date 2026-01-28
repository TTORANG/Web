import { Toaster } from 'sonner';

import { useThemeStore } from '@/stores/themeStore';

/**
 * Toast 알림 Provider
 *
 * @description sonner 라이브러리를 사용한 토스트 알림을 제공합니다.
 * 현재 테마(light/dark)에 맞춰 자동으로 스타일이 적용됩니다.
 *
 * @see {@link https://sonner.emilkowal.ski sonner 공식 문서}
 */
export function ToastProvider() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  return <Toaster position="bottom-center" closeButton theme={resolvedTheme} />;
}
