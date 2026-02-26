import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ScriptPanel from './ScriptPanel';

vi.mock('@/components/slide/script/SlideTitle', () => ({
  default: () => <div data-testid="slide-title" />,
}));

describe('ScriptPanel', () => {
  it('applies readable wrap class to script body text', () => {
    render(<ScriptPanel script="긴 대본 본문 텍스트" fallbackTitle="슬라이드 1" />);

    expect(screen.getByText('긴 대본 본문 텍스트')).toHaveClass('text-wrap-readable');
  });

  it('applies readable wrap class to empty fallback text', () => {
    render(<ScriptPanel fallbackTitle="슬라이드 1" />);

    expect(screen.getByText('대본이 없습니다.')).toHaveClass('text-wrap-readable');
  });
});
