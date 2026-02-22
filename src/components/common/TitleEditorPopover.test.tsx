import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TitleEditorPopover } from './TitleEditorPopover';

describe('TitleEditorPopover', () => {
  it('re-initializes input value from inputTitle whenever popover opens', async () => {
    const user = userEvent.setup();

    render(
      <TitleEditorPopover
        title="슬라이드 1"
        inputTitle=""
        inputPlaceholder="슬라이드 1"
        ariaLabel="슬라이드 이름 변경"
      />,
    );

    const triggerButton = screen.getByRole('button', { name: '슬라이드 이름 변경' });

    await user.click(triggerButton);
    const input = screen.getByRole('textbox', { name: '슬라이드 이름 변경' });
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', '슬라이드 1');

    await user.type(input, '임시 제목');
    expect(input).toHaveValue('임시 제목');

    await user.click(triggerButton); // close
    await user.click(triggerButton); // reopen

    expect(screen.getByRole('textbox', { name: '슬라이드 이름 변경' })).toHaveValue('');
  });

  it('uses title as default input value when title exists', async () => {
    const user = userEvent.setup();

    render(
      <TitleEditorPopover
        title="도입"
        inputTitle="도입"
        inputPlaceholder="슬라이드 1"
        ariaLabel="슬라이드 이름 변경"
      />,
    );

    const triggerButton = screen.getByRole('button', { name: '슬라이드 이름 변경' });

    await user.click(triggerButton);
    const input = screen.getByRole('textbox', { name: '슬라이드 이름 변경' });
    expect(input).toHaveValue('도입');

    await user.clear(input);
    await user.type(input, '변경 전 임시 값');
    expect(input).toHaveValue('변경 전 임시 값');

    await user.click(triggerButton); // close
    await user.click(triggerButton); // reopen

    expect(screen.getByRole('textbox', { name: '슬라이드 이름 변경' })).toHaveValue('도입');
  });
});
