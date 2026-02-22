import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UserAvatar } from './UserAvatar';

describe('UserAvatar', () => {
  it('renders img when src is valid and load succeeds', () => {
    render(<UserAvatar src="https://example.com/avatar.png" alt="정제훈" size={32} />);

    const avatar = screen.getByRole('img', { name: '정제훈' });
    expect(avatar.tagName).toBe('IMG');
  });

  it('falls back to placeholder icon when image load fails', () => {
    render(<UserAvatar src="https://example.com/avatar.png" alt="정제훈" size={32} />);

    const avatar = screen.getByRole('img', { name: '정제훈' });
    fireEvent.error(avatar);

    const fallback = screen.getByRole('img', { name: '정제훈' });
    expect(fallback.tagName).toBe('DIV');
  });

  it('tries rendering image again when src changes after failure', () => {
    const { rerender } = render(
      <UserAvatar src="https://example.com/avatar-1.png" alt="정제훈" size={32} />,
    );

    fireEvent.error(screen.getByRole('img', { name: '정제훈' }));
    expect(screen.getByRole('img', { name: '정제훈' }).tagName).toBe('DIV');

    rerender(<UserAvatar src="https://example.com/avatar-2.png" alt="정제훈" size={32} />);

    expect(screen.getByRole('img', { name: '정제훈' }).tagName).toBe('IMG');
  });
});
