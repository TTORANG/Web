import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProgressBar from './ProgressBar';

function getProgressNodes(container: HTMLElement) {
  const progressNodes = Array.from(container.querySelectorAll('div')).filter((node) =>
    node.className.includes('bg-[#4F5BFF]'),
  );

  const fill = progressNodes.find((node) => node.className.includes('h-full'));
  const thumb = progressNodes.find(
    (node) => node.className.includes('h-3') && node.className.includes('w-3'),
  );

  return { fill, thumb };
}

describe('Feedback ProgressBar', () => {
  it('clamps played progress to 100% when currentTime exceeds duration', () => {
    const { container } = render(
      <ProgressBar currentTime={11} duration={10} onSeek={vi.fn()} disabled={false} />,
    );
    const { fill, thumb } = getProgressNodes(container);

    expect(fill).toHaveStyle({ width: '100%' });
    expect(thumb).toHaveStyle({
      left: 'calc(100% - 1px)',
      transform: 'translate(-100%, -50%)',
    });
  });

  it('clamps played progress to 0% for negative currentTime', () => {
    const { container } = render(
      <ProgressBar currentTime={-1} duration={10} onSeek={vi.fn()} disabled={false} />,
    );
    const { fill, thumb } = getProgressNodes(container);

    expect(fill).toHaveStyle({ width: '0%' });
    expect(thumb).toHaveStyle({
      left: '1px',
      transform: 'translate(0%, -50%)',
    });
  });
});
