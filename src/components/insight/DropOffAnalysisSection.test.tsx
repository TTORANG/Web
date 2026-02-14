import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import DropOffAnalysisSection from './DropOffAnalysisSection';

describe('DropOffAnalysisSection', () => {
  it('calls slide thumbnail callback with slide index', async () => {
    const user = userEvent.setup();
    const onSlideThumbClick = vi.fn();

    render(
      <DropOffAnalysisSection
        dropOffSlides={[
          { label: '슬라이드 1', desc: '10명 이탈', percent: 50, slideIndex: 0, count: 10 },
        ]}
        dropOffTimes={[{ time: '0:01', desc: '슬라이드 1', count: 3, slideIndex: 0, seconds: 1 }]}
        getThumb={() => 'https://example.com/slide-1.png'}
        showVideoDropOff
        onSlideThumbClick={onSlideThumbClick}
      />,
    );

    const thumbButtons = screen.getAllByRole('button', { name: '슬라이드 1 썸네일 위치로 이동' });
    await user.click(thumbButtons[0]);

    expect(onSlideThumbClick).toHaveBeenCalledTimes(1);
    expect(onSlideThumbClick).toHaveBeenCalledWith(0);
  });

  it('calls video time callback with seconds', async () => {
    const user = userEvent.setup();
    const onVideoTimeClick = vi.fn();

    render(
      <DropOffAnalysisSection
        dropOffSlides={[
          { label: '슬라이드 1', desc: '10명 이탈', percent: 50, slideIndex: 0, count: 10 },
        ]}
        dropOffTimes={[{ time: '0:01', desc: '슬라이드 1', count: 3, slideIndex: 0, seconds: 1 }]}
        getThumb={() => 'https://example.com/slide-1.png'}
        showVideoDropOff
        onVideoTimeClick={onVideoTimeClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: '영상 0:01로 이동' }));

    expect(onVideoTimeClick).toHaveBeenCalledTimes(1);
    expect(onVideoTimeClick).toHaveBeenCalledWith(1);
  });
});
