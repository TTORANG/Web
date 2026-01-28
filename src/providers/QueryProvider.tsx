import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/api';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query Provider
 *
 * @description 서버 상태 관리를 위한 QueryClient를 제공하며,
 * 개발 환경에서는 ReactQueryDevtools를 함께 렌더링합니다.
 *
 * @see {@link https://tanstack.com/query/latest TanStack Query 공식 문서}
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
