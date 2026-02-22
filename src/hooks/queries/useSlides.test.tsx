import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSlides } from './useSlides';

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

describe('useSlides', () => {
  const mockedUseQuery = vi.mocked(useQuery);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseQuery.mockReturnValue({} as never);
  });

  it('기본값은 폴링이 비활성화된다', () => {
    renderHook(() => useSlides('project-1'));

    const options = mockedUseQuery.mock.calls[0]?.[0] as {
      enabled: boolean;
      refetchInterval: number | false;
    };

    expect(options.enabled).toBe(true);
    expect(options.refetchInterval).toBe(false);
  });

  it('liveSync가 true면 지정한 주기로 폴링한다', () => {
    renderHook(() => useSlides('project-1', { liveSync: true, pollingIntervalMs: 15000 }));

    const options = mockedUseQuery.mock.calls[0]?.[0] as unknown as {
      refetchInterval: (query: { state: { error: unknown } }) => number | false;
    };

    const getInterval = options.refetchInterval;
    expect(getInterval({ state: { error: null } })).toBe(15000);
  });

  it('liveSync 폴링 중 401 에러면 폴링을 중단한다', () => {
    renderHook(() => useSlides('project-1', { liveSync: true }));

    const options = mockedUseQuery.mock.calls[0]?.[0] as unknown as {
      refetchInterval: (query: { state: { error: unknown } }) => number | false;
    };

    const getInterval = options.refetchInterval;
    expect(
      getInterval({
        state: {
          error: {
            isAxiosError: true,
            response: { status: 401 },
          },
        },
      }),
    ).toBe(false);
  });

  it('enabled 옵션으로 요청을 비활성화할 수 있다', () => {
    renderHook(() => useSlides('project-1', { enabled: false }));

    const options = mockedUseQuery.mock.calls[0]?.[0] as {
      enabled: boolean;
    };

    expect(options.enabled).toBe(false);
  });
});
