import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { SlideListItem } from '@/types';

import ScriptSection from './ScriptSection';

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    writable: true,
  });
});

const slide: SlideListItem = {
  slideId: 'slide-1',
  projectId: 'project-1',
  script: '긴 대본 텍스트',
  title: '슬라이드 1',
  slideNum: 1,
  imageUrl: 'https://example.com/slide-1.png',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ScriptSection', () => {
  it('applies readable wrap class to each script paragraph', () => {
    render(<ScriptSection slides={[slide]} slideChangeTimes={[0]} currentTime={0} />);

    expect(screen.getByText('긴 대본 텍스트')).toHaveClass('text-wrap-readable');
  });
});
