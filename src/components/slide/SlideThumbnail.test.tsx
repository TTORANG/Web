import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { SlideListItem } from '@/types/slide';

import SlideThumbnail from './SlideThumbnail';

const PROJECT_ID = 'project-1';

const slide: SlideListItem = {
  slideId: 'slide-1',
  projectId: PROJECT_ID,
  title: '첫 번째 슬라이드',
  slideNum: 1,
  imageUrl: 'https://example.com/slide-1.webp',
  script: '',
  createdAt: '2026-02-13T00:00:00.000Z',
  updatedAt: '2026-02-13T00:00:00.000Z',
};

function renderInSlideRoute(element: ReactElement) {
  return render(
    <MemoryRouter initialEntries={[`/${PROJECT_ID}/slide/${slide.slideId}`]}>
      <Routes>
        <Route path="/:projectId/slide/:slideId" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SlideThumbnail', () => {
  it('reserves thumbnail area with 16:9 aspect ratio', () => {
    renderInSlideRoute(<SlideThumbnail slide={slide} index={0} />);

    const image = screen.getByRole('img', { name: /슬라이드 1:/ });
    expect(image.parentElement).toHaveClass('aspect-video');
  });

  it('keeps 16:9 placeholder while loading', () => {
    const { container } = renderInSlideRoute(<SlideThumbnail index={0} isLoading />);
    const placeholder = container.querySelector('.animate-pulse');

    expect(placeholder).not.toBeNull();
    expect(placeholder).toHaveClass('aspect-video');
  });
});
