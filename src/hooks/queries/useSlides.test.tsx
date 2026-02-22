import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetSlideResponseDto, UpdateSlideResponseDto } from '@/api/dto';
import { updateSlide } from '@/api/endpoints/slides';
import { queryKeys } from '@/api/queryClient';
import type { SlideListItem } from '@/types/slide';

import { useUpdateSlide } from './useSlides';

vi.mock('@/api/endpoints/slides', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/endpoints/slides')>('@/api/endpoints/slides');
  return {
    ...actual,
    updateSlide: vi.fn(),
  };
});

const mockedUpdateSlide = vi.mocked(updateSlide);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function makeListItem(overrides?: Partial<SlideListItem>): SlideListItem {
  return {
    slideId: 's1',
    projectId: 'p1',
    title: '기존 제목',
    slideNum: 1,
    imageUrl: 'https://example.com/1.png',
    script: '',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeDetail(overrides?: Partial<GetSlideResponseDto>): GetSlideResponseDto {
  return {
    slideId: 's1',
    projectId: 'p1',
    title: '기존 제목',
    slideNum: 1,
    imageUrl: 'https://example.com/1.png',
    prevSlideId: null,
    nextSlideId: null,
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useUpdateSlide', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('optimistically updates detail/list cache and keeps server response values', async () => {
    let resolveMutation: ((value: UpdateSlideResponseDto) => void) | undefined;

    mockedUpdateSlide.mockImplementation(
      () =>
        new Promise<UpdateSlideResponseDto>((resolve) => {
          resolveMutation = resolve;
        }),
    );

    queryClient.setQueryData(queryKeys.slides.detail('s1'), makeDetail());
    queryClient.setQueryData(queryKeys.slides.list('p1'), [
      makeListItem(),
      makeListItem({ slideId: 's2', title: '다른 슬라이드', slideNum: 2 }),
    ]);

    const { result } = renderHook(() => useUpdateSlide(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ slideId: 's1', data: { title: '새 제목' } });
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<GetSlideResponseDto>(queryKeys.slides.detail('s1'))?.title,
      ).toBe('새 제목');
      expect(
        queryClient.getQueryData<SlideListItem[]>(queryKeys.slides.list('p1'))?.[0]?.title,
      ).toBe('새 제목');
    });

    await act(async () => {
      resolveMutation?.({
        slideId: 's1',
        title: '서버 제목',
        slideNum: 1,
        imageUrl: 'https://example.com/updated.png',
        updatedAt: '2026-02-22T12:00:00Z',
      });
      await Promise.resolve();
    });

    const detail = queryClient.getQueryData<GetSlideResponseDto>(queryKeys.slides.detail('s1'));
    const list = queryClient.getQueryData<SlideListItem[]>(queryKeys.slides.list('p1'));

    expect(detail?.title).toBe('서버 제목');
    expect(detail?.updatedAt).toBe('2026-02-22T12:00:00Z');
    expect(list?.[0]?.title).toBe('서버 제목');
    expect(list?.[0]?.imageUrl).toBe('https://example.com/updated.png');
  });

  it('rolls back optimistic cache when mutation fails', async () => {
    mockedUpdateSlide.mockRejectedValue(new Error('update failed'));

    queryClient.setQueryData(queryKeys.slides.detail('s1'), makeDetail());
    queryClient.setQueryData(queryKeys.slides.list('p1'), [makeListItem()]);

    const { result } = renderHook(() => useUpdateSlide(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ slideId: 's1', data: { title: '실패 제목' } }),
      ).rejects.toThrow('update failed');
    });

    expect(
      queryClient.getQueryData<GetSlideResponseDto>(queryKeys.slides.detail('s1'))?.title,
    ).toBe('기존 제목');
    expect(queryClient.getQueryData<SlideListItem[]>(queryKeys.slides.list('p1'))?.[0]?.title).toBe(
      '기존 제목',
    );
  });
});
