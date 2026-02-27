import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import RecentCommentItem from './RecentCommentItem';

describe('RecentCommentItem', () => {
  it('calls onThumbClick when thumbnail is clicked', async () => {
    const user = userEvent.setup();
    const onThumbClick = vi.fn();

    render(
      <RecentCommentItem
        user="Alex"
        slideLabel="슬라이드 2"
        time="0:01"
        text="좋은 발표였습니다."
        thumbUrl="https://example.com/slide-2.png"
        thumbFallbackClassName="w-full aspect-video rounded bg-gray-200"
        onThumbClick={onThumbClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: '슬라이드 2 썸네일로 이동' }));
    expect(onThumbClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('좋은 발표였습니다.')).toHaveClass('text-wrap-readable');
  });

  it('calls onTimeClick when timestamp is clicked', async () => {
    const user = userEvent.setup();
    const onTimeClick = vi.fn();

    render(
      <RecentCommentItem
        user="Alex"
        slideLabel="슬라이드 2"
        time="0:01"
        text="좋은 발표였습니다."
        thumbFallbackClassName="w-full aspect-video rounded bg-gray-200"
        onTimeClick={onTimeClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: '영상 0:01로 이동' }));
    expect(onTimeClick).toHaveBeenCalledTimes(1);
  });
});
