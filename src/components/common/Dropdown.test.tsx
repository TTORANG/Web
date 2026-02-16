import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dropdown } from './Dropdown';

describe('Dropdown', () => {
  it('applies elevated layering classes only while open', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown
        trigger={<span>메뉴</span>}
        items={[{ id: 'rename', label: '이름 변경', onClick: vi.fn() }]}
      />,
    );

    const toggle = screen.getByRole('button', { name: '메뉴' });
    const root = toggle.parentElement;

    expect(root).toHaveClass('relative');
    expect(root).not.toHaveClass('z-[70]');

    await user.click(toggle);

    expect(root).toHaveClass('z-[70]');
    expect(screen.getByRole('menu')).toHaveClass('z-[71]');

    await user.click(toggle);

    expect(root).not.toHaveClass('z-[70]');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps keyboard interactions (arrow, enter, escape)', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();

    render(
      <Dropdown
        trigger={<span>메뉴</span>}
        items={[
          { id: 'rename', label: '이름 변경', onClick: onRename },
          { id: 'delete', label: '삭제', onClick: vi.fn() },
        ]}
      />,
    );

    const toggle = screen.getByRole('button', { name: '메뉴' });

    await user.click(toggle);
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(toggle);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls onOpenChange with open/close state', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dropdown
        trigger={<span>메뉴</span>}
        items={[{ id: 'rename', label: '이름 변경', onClick: vi.fn() }]}
        onOpenChange={onOpenChange}
      />,
    );

    const toggle = screen.getByRole('button', { name: '메뉴' });

    await user.click(toggle);
    await user.click(toggle);

    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });
});
