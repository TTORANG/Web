import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSlideStore } from '@/stores/slideStore';
import { createMockComment, createMockSlide } from '@/test/fixtures';

import {
  useSlideActions,
  useSlideComments,
  useSlideId,
  useSlideScript,
  useSlideThumb,
  useSlideTitle,
} from './useSlideSelectors';

function resetStore() {
  useSlideStore.setState({ slide: null });
}

describe('useSlideSelectors', () => {
  beforeEach(resetStore);

  describe('when slide is null', () => {
    it('useSlideId returns empty string', () => {
      const { result } = renderHook(() => useSlideId());
      expect(result.current).toBe('');
    });

    it('useSlideTitle returns null', () => {
      const { result } = renderHook(() => useSlideTitle());
      expect(result.current).toBeNull();
    });

    it('useSlideThumb returns empty string', () => {
      const { result } = renderHook(() => useSlideThumb());
      expect(result.current).toBe('');
    });

    it('useSlideScript returns empty string', () => {
      const { result } = renderHook(() => useSlideScript());
      expect(result.current).toBe('');
    });

    it('useSlideComments returns empty array', () => {
      const { result } = renderHook(() => useSlideComments());
      expect(result.current).toEqual([]);
    });
  });

  describe('when slide exists', () => {
    const slide = createMockSlide({
      slideId: 'slide-1',
      title: 'Test Title',
      imageUrl: 'https://img.url',
      script: 'Test script content',
      comments: [createMockComment({ commentId: 'c1' })],
    });

    beforeEach(() => {
      useSlideStore.getState().initSlide(slide);
    });

    it('useSlideId returns slideId', () => {
      const { result } = renderHook(() => useSlideId());
      expect(result.current).toBe('slide-1');
    });

    it('useSlideTitle returns title', () => {
      const { result } = renderHook(() => useSlideTitle());
      expect(result.current).toBe('Test Title');
    });

    it('useSlideTitle preserves null title', () => {
      useSlideStore.getState().initSlide(createMockSlide({ title: null }));
      const { result } = renderHook(() => useSlideTitle());
      expect(result.current).toBeNull();
    });

    it('useSlideThumb returns imageUrl', () => {
      const { result } = renderHook(() => useSlideThumb());
      expect(result.current).toBe('https://img.url');
    });

    it('useSlideScript returns script', () => {
      const { result } = renderHook(() => useSlideScript());
      expect(result.current).toBe('Test script content');
    });

    it('useSlideComments returns comments', () => {
      const { result } = renderHook(() => useSlideComments());
      expect(result.current).toHaveLength(1);
      expect(result.current[0].commentId).toBe('c1');
    });
  });

  describe('useSlideComments reference stability', () => {
    it('returns same array reference when slide is null between renders', () => {
      const { result, rerender } = renderHook(() => useSlideComments());
      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });
  });

  describe('useSlideActions', () => {
    it('returns action functions', () => {
      const { result } = renderHook(() => useSlideActions());
      expect(typeof result.current.initSlide).toBe('function');
      expect(typeof result.current.updateSlide).toBe('function');
      expect(typeof result.current.updateScript).toBe('function');
      expect(typeof result.current.deleteComment).toBe('function');
      expect(typeof result.current.updateComment).toBe('function');
      expect(typeof result.current.setComments).toBe('function');
    });
  });
});
