import type { ReactNode } from 'react';

import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 애플리케이션 전역 Provider를 통합하여 제공하는 루트 Provider
 *
 * @description QueryProvider와 ToastProvider를 포함하며,
 * 앱 전체에서 필요한 Context들을 한 곳에서 관리합니다.
 *
 * @example
 * ```tsx
 * <AppProviders>
 *   <App />
 * </AppProviders>
 * ```
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      {children}
      <ToastProvider />
    </QueryProvider>
  );
}
