import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SlideImage from './SlideImage';

describe('SlideImage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows cached image immediately when img.complete is true', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1280);

    render(<SlideImage src="/slides/cached.webp" alt="cached slide" />);

    const img = screen.getByRole('img', { name: 'cached slide' });

    await waitFor(() => {
      expect(img).toHaveClass('opacity-100');
    });

    expect(img).not.toHaveClass('opacity-0');
    expect(img).not.toHaveClass('animate-pulse');
  });

  it('forwards loading hints to the img element', () => {
    render(
      <SlideImage
        src="/slides/hints.webp"
        alt="hinted slide"
        loading="lazy"
        decoding="sync"
        fetchPriority="low"
      />,
    );

    const img = screen.getByRole('img', { name: 'hinted slide' });

    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'sync');
    expect(img.getAttribute('fetchpriority')).toBe('low');
  });
});
