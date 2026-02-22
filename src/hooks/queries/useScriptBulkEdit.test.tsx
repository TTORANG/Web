import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetProjectScriptsResponseDto, GetScriptResponseDto } from '@/api/dto';
import { bulkEditScripts } from '@/api/endpoints/scripts';
import { queryKeys } from '@/api/queryClient';
import type { SlideListItem } from '@/types/slide';

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
const buildSlide = (slideId: string, script: string): SlideListItem => ({
  slideId,
  script,
  projectId: '10',
  title: `slide-${slideId}`,
  slideNum: Number(slideId),
  imageUrl: `https://cdn.test/${slideId}.png`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});
const buildProjectScripts = (
  scripts: { slideId: string; scriptText: string }[],
): GetProjectScriptsResponseDto => ({
  message: 'ok',
  projectId: '10',
  scripts,
});
const buildScriptDetail = (slideId: string, scriptText: string): GetScriptResponseDto => ({
  message: 'ok',
  slideId,
  scriptText,
  charCount: scriptText.length,
  estimatedDurationSeconds: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

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

  it('요청 직후 슬라이드/대본 캐시를 낙관적으로 업데이트한다', async () => {
    let resolveMutation: ((value: Awaited<ReturnType<typeof bulkEditScripts>>) => void) | undefined;
    mockedBulkEditScripts.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMutation = resolve;
        }),
    );

    queryClient.setQueryData<SlideListItem[]>(queryKeys.slides.list('10'), [
      buildSlide('1', '기존 1'),
      buildSlide('2', '기존 2'),
    ]);
    queryClient.setQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('10'),
      buildProjectScripts([
        { slideId: '1', scriptText: '기존 1' },
        { slideId: '2', scriptText: '기존 2' },
      ]),
    );
    queryClient.setQueryData<GetScriptResponseDto>(
      queryKeys.scripts.detail('1'),
      buildScriptDetail('1', '기존 1'),
    );

    const { result } = renderHook(() => useBulkEditScripts(), { wrapper });

    const payload = {
      projectId: '10',
      data: {
        scripts: [
          { slideId: '1', scriptText: '수정 1' },
          { slideId: '2', scriptText: '수정 2' },
        ],
      },
    };

    let mutationPromise: Promise<Awaited<ReturnType<typeof bulkEditScripts>>> | undefined;
    await act(async () => {
      mutationPromise = result.current.mutateAsync(payload);
      await Promise.resolve();
    });

    expect(queryClient.getQueryData<SlideListItem[]>(queryKeys.slides.list('10'))).toEqual([
      buildSlide('1', '수정 1'),
      buildSlide('2', '수정 2'),
    ]);
    expect(
      queryClient.getQueryData<GetProjectScriptsResponseDto>(queryKeys.scripts.project('10')),
    ).toEqual(
      buildProjectScripts([
        { slideId: '1', scriptText: '수정 1' },
        { slideId: '2', scriptText: '수정 2' },
      ]),
    );
    expect(queryClient.getQueryData<GetScriptResponseDto>(queryKeys.scripts.detail('1'))).toEqual(
      buildScriptDetail('1', '수정 1'),
    );

    await act(async () => {
      resolveMutation?.({
        message: 'ok',
        projectId: '10',
        requestedSlideCount: 2,
        updatedSlideCount: 2,
        unchangedSlideCount: 0,
        updatedSlideIds: ['1', '2'],
      });
      await mutationPromise;
    });
  });

  it('실패 시 에러를 호출자에게 전달한다', async () => {
    mockedBulkEditScripts.mockRejectedValue(new Error('bulk edit failed'));

    queryClient.setQueryData<SlideListItem[]>(queryKeys.slides.list('10'), [
      buildSlide('1', '기존 1'),
      buildSlide('2', '기존 2'),
    ]);
    queryClient.setQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('10'),
      buildProjectScripts([
        { slideId: '1', scriptText: '기존 1' },
        { slideId: '2', scriptText: '기존 2' },
      ]),
    );
    queryClient.setQueryData<GetScriptResponseDto>(
      queryKeys.scripts.detail('1'),
      buildScriptDetail('1', '기존 1'),
    );

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

    expect(queryClient.getQueryData<SlideListItem[]>(queryKeys.slides.list('10'))).toEqual([
      buildSlide('1', '기존 1'),
      buildSlide('2', '기존 2'),
    ]);
    expect(
      queryClient.getQueryData<GetProjectScriptsResponseDto>(queryKeys.scripts.project('10')),
    ).toEqual(
      buildProjectScripts([
        { slideId: '1', scriptText: '기존 1' },
        { slideId: '2', scriptText: '기존 2' },
      ]),
    );
    expect(queryClient.getQueryData<GetScriptResponseDto>(queryKeys.scripts.detail('1'))).toEqual(
      buildScriptDetail('1', '기존 1'),
    );
  });
});
