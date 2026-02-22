import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import { describe, expect, it, vi } from 'vitest';

import { RetentionChartTooltip } from './RetentionChartTooltip';

type RetentionTooltipProps = TooltipContentProps<ValueType, NameType> & {
  hasVideo: boolean;
  onVideoTimeClick?: (seconds: number) => void;
};

describe('RetentionChartTooltip', () => {
  it('shows thumbnail and seeks when tooltip is clicked in video mode', async () => {
    const user = userEvent.setup();
    const onVideoTimeClick = vi.fn();

    const props = {
      active: true,
      label: '4:20',
      hasVideo: true,
      onVideoTimeClick,
      payload: [
        {
          payload: {
            label: '4:20',
            value: 58,
            tooltipTitle: '4:20',
            sessionCount: 12,
            seekSeconds: 260,
            thumbUrl: 'https://example.com/slide-thumb.png',
          },
        },
      ],
    } as unknown as RetentionTooltipProps;

    render(<RetentionChartTooltip {...props} />);

    expect(screen.getByRole('img', { name: '4:20 시점 썸네일' })).toHaveAttribute(
      'src',
      'https://example.com/slide-thumb.png',
    );

    await user.click(screen.getByRole('button', { name: '영상 4:20로 이동' }));

    expect(onVideoTimeClick).toHaveBeenCalledTimes(1);
    expect(onVideoTimeClick).toHaveBeenCalledWith(260);
  });

  it('keeps slide tooltip as non-clickable text', () => {
    const props = {
      active: true,
      label: 'S1',
      hasVideo: false,
      payload: [
        {
          payload: {
            label: 'S1',
            value: 70,
            tooltipTitle: '슬라이드 1',
            sessionCount: 20,
          },
        },
      ],
    } as unknown as RetentionTooltipProps;

    render(<RetentionChartTooltip {...props} />);

    expect(screen.getByText('슬라이드 1')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
