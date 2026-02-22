import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetProjectScriptsResponseDto, GetScriptResponseDto } from '@/api/dto';
import { updateScript } from '@/api/endpoints/scripts';
import { queryKeys } from '@/api/queryClient';
import type { SlideListItem } from '@/types/slide';

import { useUpdateScript } from './useScript';

vi.mock('@/api/endpoints/scripts', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/endpoints/scripts')>('@/api/endpoints/scripts');
  return {
    ...actual,
    updateScript: vi.fn(),
  };
});

const mockedUpdateScript = vi.mocked(updateScript);

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

function buildSlide(overrides?: Partial<SlideListItem>): SlideListItem {
  return {
    slideId: 's1',
    projectId: 'p1',
    title: '슬라이드 1',
    slideNum: 1,
    imageUrl: 'https://example.com/slide-1.png',
    script: 'server-old',
    createdAt: '2026-02-22T00:00:00Z',
    updatedAt: '2026-02-22T00:00:00Z',
    ...overrides,
  };
}

function buildScriptDetail(overrides?: Partial<GetScriptResponseDto>): GetScriptResponseDto {
  return {
    message: 'ok',
    slideId: 's1',
    charCount: 10,
    scriptText: 'server-old',
    estimatedDurationSeconds: 1,
    createdAt: '2026-02-22T00:00:00Z',
    updatedAt: '2026-02-22T00:00:00Z',
    ...overrides,
  };
}

function buildProjectScripts(
  projectId: string,
  scripts: Array<{ slideId: string; scriptText: string }>,
): GetProjectScriptsResponseDto {
  return {
    message: 'ok',
    projectId,
    scripts,
  };
}

describe('useUpdateScript', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('프로젝트 id가 있을 때 서버 응답이 stale여도 로컬 요청 대본을 캐시에 유지한다', async () => {
    mockedUpdateScript.mockResolvedValue(
      buildScriptDetail({
        scriptText: 'server-stale',
        charCount: 999,
        updatedAt: '2026-02-22T09:30:00Z',
      }),
    );

    queryClient.setQueryData<GetScriptResponseDto>(
      queryKeys.scripts.detail('s1'),
      buildScriptDetail(),
    );
    queryClient.setQueryData<SlideListItem[]>(queryKeys.slides.list('p1'), [
      buildSlide({ slideId: 's1', projectId: 'p1', script: 'before' }),
      buildSlide({ slideId: 's2', projectId: 'p1', script: 'keep', slideNum: 2 }),
    ]);
    queryClient.setQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('p1'),
      buildProjectScripts('p1', [
        { slideId: 's1', scriptText: 'before' },
        { slideId: 's2', scriptText: 'keep' },
      ]),
    );

    const { result } = renderHook(() => useUpdateScript(), { wrapper: createWrapper(queryClient) });
    const clientScriptText = 'client-latest';

    await act(async () => {
      await result.current.mutateAsync({
        slideId: 's1',
        projectId: 'p1',
        data: { script: clientScriptText },
      });
    });

    const detail = queryClient.getQueryData<GetScriptResponseDto>(queryKeys.scripts.detail('s1'));
    const slides = queryClient.getQueryData<SlideListItem[]>(queryKeys.slides.list('p1'));
    const projectScripts = queryClient.getQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('p1'),
    );

    expect(detail?.scriptText).toBe(clientScriptText);
    expect(detail?.charCount).toBe(clientScriptText.length);
    expect(detail?.updatedAt).toBe('2026-02-22T09:30:00Z');
    expect(slides?.[0]?.script).toBe(clientScriptText);
    expect(slides?.[1]?.script).toBe('keep');
    expect(projectScripts?.scripts[0]?.scriptText).toBe(clientScriptText);
    expect(projectScripts?.scripts[1]?.scriptText).toBe('keep');
  });

  it('프로젝트 id가 없을 때 목록 캐시 탐색 경로에서도 로컬 요청 대본을 기준으로 반영한다', async () => {
    mockedUpdateScript.mockResolvedValue(
      buildScriptDetail({
        scriptText: 'server-stale',
        charCount: 1,
      }),
    );

    queryClient.setQueryData<GetScriptResponseDto>(
      queryKeys.scripts.detail('s1'),
      buildScriptDetail(),
    );
    queryClient.setQueryData<SlideListItem[]>(queryKeys.slides.list('p1'), [
      buildSlide({ slideId: 's1', projectId: 'p1', script: 'before' }),
    ]);
    queryClient.setQueryData<SlideListItem[]>(queryKeys.slides.list('p2'), [
      buildSlide({ slideId: 's3', projectId: 'p2', script: 'other' }),
    ]);
    queryClient.setQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('p1'),
      buildProjectScripts('p1', [{ slideId: 's1', scriptText: 'before' }]),
    );
    queryClient.setQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('p2'),
      buildProjectScripts('p2', [{ slideId: 's3', scriptText: 'other' }]),
    );

    const { result } = renderHook(() => useUpdateScript(), { wrapper: createWrapper(queryClient) });
    const clientScriptText = 'client-from-query-scan';

    await act(async () => {
      await result.current.mutateAsync({
        slideId: 's1',
        data: { script: clientScriptText },
      });
    });

    const detail = queryClient.getQueryData<GetScriptResponseDto>(queryKeys.scripts.detail('s1'));
    const p1Slides = queryClient.getQueryData<SlideListItem[]>(queryKeys.slides.list('p1'));
    const p2Slides = queryClient.getQueryData<SlideListItem[]>(queryKeys.slides.list('p2'));
    const p1Scripts = queryClient.getQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('p1'),
    );
    const p2Scripts = queryClient.getQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('p2'),
    );

    expect(detail?.scriptText).toBe(clientScriptText);
    expect(detail?.charCount).toBe(clientScriptText.length);
    expect(p1Slides?.[0]?.script).toBe(clientScriptText);
    expect(p2Slides?.[0]?.script).toBe('other');
    expect(p1Scripts?.scripts[0]?.scriptText).toBe(clientScriptText);
    expect(p2Scripts?.scripts[0]?.scriptText).toBe('other');
  });

  it('프로젝트 id와 목록 캐시가 없어도 프로젝트 스크립트 탐색 경로에서 로컬 요청 대본을 반영한다', async () => {
    mockedUpdateScript.mockResolvedValue(
      buildScriptDetail({
        scriptText: 'server-stale',
        charCount: 0,
      }),
    );

    queryClient.setQueryData<GetScriptResponseDto>(
      queryKeys.scripts.detail('s1'),
      buildScriptDetail(),
    );
    queryClient.setQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('p1'),
      buildProjectScripts('p1', [{ slideId: 's1', scriptText: 'before' }]),
    );

    const { result } = renderHook(() => useUpdateScript(), { wrapper: createWrapper(queryClient) });
    const clientScriptText = 'client-fallback';

    await act(async () => {
      await result.current.mutateAsync({
        slideId: 's1',
        data: { script: clientScriptText },
      });
    });

    const projectScripts = queryClient.getQueryData<GetProjectScriptsResponseDto>(
      queryKeys.scripts.project('p1'),
    );
    expect(projectScripts?.scripts[0]?.scriptText).toBe(clientScriptText);
  });
});
