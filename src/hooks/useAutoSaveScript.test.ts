import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSlideStore } from '@/stores/slideStore';
import { createMockSlide } from '@/test/fixtures';

import { useAutoSaveScript } from './useAutoSaveScript';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

// Mock useUpdateScript
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/queries/useScript', () => ({
  useUpdateScript: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('useAutoSaveScript', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-22T15:10:00Z'));
    vi.clearAllMocks();
    useSlideStore
      .getState()
      .initSlide(createMockSlide({ slideId: 'slide-1', projectId: 'project-1' }));
  });

  afterEach(() => {
    vi.useRealTimers();
    useSlideStore.setState({ slide: null });
  });

  it('calls mutateAsync after debounce delay', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('new script');
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      slideId: 'slide-1',
      projectId: 'project-1',
      data: { script: 'new script' },
    });
  });

  it('sets saved status and lastSavedAt when save succeeds', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.lastSavedAt).not.toBeNull();
  });

  it('sets error status when save fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.saveStatus).toBe('error');
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('skips save when slideId is empty', async () => {
    useSlideStore.setState({ slide: null });
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('skips save when script is same as last saved', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { result } = renderHook(() => useAutoSaveScript());

    // First save
    act(() => {
      result.current.autoSave('same text');
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    // Second save with same text
    act(() => {
      result.current.autoSave('same text');
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(mockMutateAsync).toHaveBeenCalledTimes(1); // not called again
  });

  it('retries pending script when browser comes back online', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({});
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('offline draft');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await Promise.resolve();
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    expect(mockMutateAsync).toHaveBeenLastCalledWith({
      slideId: 'slide-1',
      projectId: 'project-1',
      data: { script: 'offline draft' },
    });
  });

  it('flushes pending script immediately on online event before debounce delay', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('quick draft');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await Promise.resolve();
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      slideId: 'slide-1',
      projectId: 'project-1',
      data: { script: 'quick draft' },
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('flushSave saves immediately without waiting for debounce', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('blur draft');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();

    await act(async () => {
      result.current.flushSave();
      await Promise.resolve();
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      slideId: 'slide-1',
      projectId: 'project-1',
      data: { script: 'blur draft' },
    });
  });

  it('saves newer pending script after in-flight save completes', async () => {
    const firstSave = createDeferred<object>();
    mockMutateAsync.mockImplementationOnce(() => firstSave.promise).mockResolvedValueOnce({});

    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('first');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenNthCalledWith(1, {
      slideId: 'slide-1',
      projectId: 'project-1',
      data: { script: 'first' },
    });

    act(() => {
      result.current.autoSave('second');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      firstSave.resolve({});
      await Promise.resolve();
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    expect(mockMutateAsync).toHaveBeenNthCalledWith(2, {
      slideId: 'slide-1',
      projectId: 'project-1',
      data: { script: 'second' },
    });
  });
});
