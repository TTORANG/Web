import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bulkEditScripts } from '@/api/endpoints/scripts';
import { queryKeys } from '@/api/queryClient';

import { useBulkEditScripts } from './useScript';

vi.mock('@/api/endpoints/scripts', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/endpoints/scripts')>('@/api/endpoints/scripts');
  return {
    ...actual,
    bulkEditScripts: vi.fn(),
  };
});

const mockedBulkEditScripts = vi.mocked(bulkEditScripts);

describe('useBulkEditScripts', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('성공 시 슬라이드/대본 캐시를 무효화한다', async () => {
    mockedBulkEditScripts.mockResolvedValue({
      message: 'ok',
      projectId: '10',
      requestedSlideCount: 2,
      updatedSlideCount: 1,
      unchangedSlideCount: 1,
      updatedSlideIds: ['1'],
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useBulkEditScripts(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        projectId: '10',
        data: {
          scripts: [
            { slideId: '1', scriptText: '수정 1' },
            { slideId: '2', scriptText: '수정 2' },
          ],
        },
      });
    });

    expect(mockedBulkEditScripts).toHaveBeenCalledWith('10', {
      scripts: [
        { slideId: '1', scriptText: '수정 1' },
        { slideId: '2', scriptText: '수정 2' },
      ],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.slides.list('10') });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.scripts.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.scripts.project('10') });
  });

  it('실패 시 에러를 호출자에게 전달한다', async () => {
    mockedBulkEditScripts.mockRejectedValue(new Error('bulk edit failed'));

    const { result } = renderHook(() => useBulkEditScripts(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          projectId: '10',
          data: {
            scripts: [{ slideId: '1', scriptText: 'x' }],
          },
        }),
      ).rejects.toThrow('bulk edit failed');
    });
  });
});
