import { fireEvent, render } from '@testing-library/react';
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

  it('supports touch scrubbing and updates seek continuously', () => {
    const onSeek = vi.fn();
    const { container } = render(
      <ProgressBar currentTime={0} duration={100} onSeek={onSeek} disabled={false} />,
    );
    const bar = container.firstElementChild as HTMLDivElement;
    expect(bar).toBeTruthy();

    bar.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        top: 0,
        right: 200,
        bottom: 12,
        left: 0,
        width: 200,
        height: 12,
        toJSON: () => ({}),
      }) as DOMRect;

    fireEvent.pointerDown(bar, { pointerId: 1, pointerType: 'touch', clientX: 20 });
    fireEvent.pointerMove(bar, { pointerId: 1, pointerType: 'touch', clientX: 120 });
    fireEvent.pointerUp(bar, { pointerId: 1, pointerType: 'touch', clientX: 120 });

    expect(onSeek).toHaveBeenCalledWith(10);
    expect(onSeek).toHaveBeenCalledWith(60);
  });

  it('shows time preview while touch scrubbing', () => {
    const { container } = render(
      <ProgressBar currentTime={0} duration={100} onSeek={vi.fn()} disabled={false} />,
    );
    const bar = container.firstElementChild as HTMLDivElement;
    expect(bar).toBeTruthy();

    bar.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        top: 0,
        right: 200,
        bottom: 12,
        left: 0,
        width: 200,
        height: 12,
        toJSON: () => ({}),
      }) as DOMRect;

    fireEvent.pointerDown(bar, { pointerId: 2, pointerType: 'touch', clientX: 20 });

    expect(container).toHaveTextContent('0:10');
  });
});
