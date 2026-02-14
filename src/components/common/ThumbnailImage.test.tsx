import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ThumbnailImage from './ThumbnailImage';

describe('ThumbnailImage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hides skeleton immediately when cached image is already complete', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(640);

    const { container } = render(<ThumbnailImage src="/thumbs/cached.webp" alt="cached thumb" />);

    const img = screen.getByRole('img', { name: 'cached thumb' });

    await waitFor(() => {
      expect(img).toHaveClass('opacity-100');
    });

    expect(img).not.toHaveClass('opacity-0');
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });

  it('forwards loading hints to the img element', () => {
    render(
      <ThumbnailImage
        src="/thumbs/hints.webp"
        alt="hinted thumb"
        loading="eager"
        decoding="sync"
        fetchPriority="high"
      />,
    );

    const img = screen.getByRole('img', { name: 'hinted thumb' });

    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('decoding', 'sync');
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });
});
