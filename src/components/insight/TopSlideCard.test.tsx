import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import TopSlideCard from './TopSlideCard';

describe('TopSlideCard', () => {
  it('calls onThumbClick when thumbnail is clicked', async () => {
    const user = userEvent.setup();
    const onThumbClick = vi.fn();

    render(
      <TopSlideCard
        title="슬라이드 1"
        thumbUrl="https://example.com/slide-1.png"
        reactionMetrics={[]}
        onThumbClick={onThumbClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: '슬라이드 1 썸네일로 이동' }));
    expect(onThumbClick).toHaveBeenCalledTimes(1);
  });

  it('does not render thumbnail button when onThumbClick is not provided', () => {
    render(
      <TopSlideCard
        title="슬라이드 2"
        thumbUrl="https://example.com/slide-2.png"
        reactionMetrics={[]}
      />,
    );

    expect(screen.queryByRole('button', { name: '슬라이드 2 썸네일로 이동' })).toBeNull();
  });
});
