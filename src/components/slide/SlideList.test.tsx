import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SlideListItem } from '@/types/slide';

import SlideList from './SlideList';

const PROJECT_ID = 'project-1';
const SCROLL_STORAGE_KEY = `slideListScrollTop:${PROJECT_ID}`;

const slides: SlideListItem[] = Array.from({ length: 5 }).map((_, index) => ({
  slideId: `slide-${index + 1}`,
  projectId: PROJECT_ID,
  title: `Slide ${index + 1}`,
  slideNum: index + 1,
  imageUrl: `https://example.com/slide-${index + 1}.png`,
  script: `Script ${index + 1}`,
  createdAt: '2026-02-13T00:00:00.000Z',
  updatedAt: '2026-02-13T00:00:00.000Z',
}));

const scrollIntoViewMock = vi.fn();

function renderSlideList(currentSlideId: string) {
  return render(
    <MemoryRouter initialEntries={[`/${PROJECT_ID}/slide/${slides[0].slideId}`]}>
      <Routes>
        <Route
          path="/:projectId/slide/:slideId"
          element={<SlideList slides={slides} currentSlideId={currentSlideId} />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SlideList', () => {
  beforeEach(() => {
    localStorage.clear();
    scrollIntoViewMock.mockReset();

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: scrollIntoViewMock,
    });
  });

  it('does not auto-scroll on initial render', () => {
    renderSlideList(slides[3].slideId);
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('auto-scrolls when current slide changes after initial render', () => {
    const { rerender } = renderSlideList(slides[1].slideId);

    rerender(
      <MemoryRouter initialEntries={[`/${PROJECT_ID}/slide/${slides[0].slideId}`]}>
        <Routes>
          <Route
            path="/:projectId/slide/:slideId"
            element={<SlideList slides={slides} currentSlideId={slides[2].slideId} />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
  });

  it('restores saved scrollTop from localStorage on mount', () => {
    localStorage.setItem(SCROLL_STORAGE_KEY, '180');

    const { container } = renderSlideList(slides[1].slideId);
    const scrollContainer = container.querySelector('aside');

    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer?.scrollTop).toBe(180);
  });

  it('saves scrollTop to localStorage on scroll event', () => {
    const { container } = renderSlideList(slides[1].slideId);
    const scrollContainer = container.querySelector('aside');

    expect(scrollContainer).not.toBeNull();

    if (!scrollContainer) return;

    scrollContainer.scrollTop = 234;
    fireEvent.scroll(scrollContainer);

    expect(localStorage.getItem(SCROLL_STORAGE_KEY)).toBe('234');
  });

  it('starts from top when no saved scroll value exists', () => {
    const { container } = renderSlideList(slides[2].slideId);
    const scrollContainer = container.querySelector('aside');

    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer?.scrollTop).toBe(0);
  });
});
