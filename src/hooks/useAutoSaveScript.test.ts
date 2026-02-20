import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSlideStore } from '@/stores/slideStore';
import { createMockSlide } from '@/test/fixtures';
import { showToast } from '@/utils/toast';

import { useAutoSaveScript } from './useAutoSaveScript';

// Mock useUpdateScript
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/queries/useScript', () => ({
  useUpdateScript: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Mock showToast
vi.mock('@/utils/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAutoSaveScript', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useSlideStore.getState().initSlide(createMockSlide({ slideId: 'slide-1' }));
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
      data: { script: 'new script' },
    });
  });

  it('shows success toast on save', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(showToast.success).toHaveBeenCalled();
  });

  it('shows error toast on failure', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useAutoSaveScript());

    act(() => {
      result.current.autoSave('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(showToast.error).toHaveBeenCalled();
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
});
