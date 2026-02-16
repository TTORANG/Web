import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Reaction } from '@/types/script';

import ReactionButtons from './ReactionButtons';

const reactions: Reaction[] = [
  { type: 'fire', count: 21 },
  { type: 'sleepy', count: 9 },
  { type: 'good', count: 9 },
  { type: 'bad', count: 3 },
  { type: 'confused', count: 2 },
];

describe('ReactionButtons', () => {
  it('uses equal-width compact grid layout when showLabel is false', () => {
    const { container } = render(
      <ReactionButtons reactions={reactions} onToggleReaction={vi.fn()} showLabel={false} />,
    );

    const root = container.firstElementChild as HTMLDivElement;
    expect(root).toHaveClass('grid', 'w-full', 'min-w-0');
    expect(root.style.gridTemplateColumns).toContain('repeat(5');
    expect(root.style.gridTemplateColumns).toContain('minmax(0, 1fr)');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    buttons.forEach((button) => {
      expect(button).toHaveClass('w-full', 'min-w-0', 'justify-center');
      expect(button).not.toHaveClass('shrink-0');
    });
  });

  it('keeps wrapped flex layout for labeled buttons', () => {
    const { container } = render(
      <ReactionButtons reactions={reactions} onToggleReaction={vi.fn()} />,
    );

    const root = container.firstElementChild as HTMLDivElement;
    expect(root).toHaveClass('flex', 'flex-wrap');
    expect(root).not.toHaveClass('grid');

    const firstButton = screen.getAllByRole('button')[0];
    expect(firstButton).toHaveClass('w-42.25');
  });

  it('keeps grid-2 layout behavior', () => {
    const { container } = render(
      <ReactionButtons reactions={reactions} onToggleReaction={vi.fn()} layout="grid-2" />,
    );

    const root = container.firstElementChild as HTMLDivElement;
    expect(root).toHaveClass('grid', 'grid-cols-2', 'justify-items-center');
  });
});
