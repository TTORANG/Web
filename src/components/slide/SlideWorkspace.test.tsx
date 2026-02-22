import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetProjectScriptsResponseDto, GetScriptResponseDto } from '@/api/dto';
import { useSlideStore } from '@/stores/slideStore';
import type { SlideListItem } from '@/types/slide';

import SlideWorkspace from './SlideWorkspace';

let projectScriptsData: GetProjectScriptsResponseDto | undefined;
let scriptData: GetScriptResponseDto | undefined;

vi.mock('@/hooks/queries/useScript', () => ({
  useProjectScripts: () => ({ data: projectScriptsData }),
  useScript: () => ({ data: scriptData }),
}));

vi.mock('@/hooks/useSlideCommentsLoader', () => ({
  useSlideCommentsLoader: vi.fn(),
}));

vi.mock('./SlideViewer', () => ({
  default: () => <div data-testid="slide-viewer" />,
}));

vi.mock('./script', () => ({
  ScriptBox: () => <div data-testid="script-box" />,
}));

function buildSlide(overrides?: Partial<SlideListItem>): SlideListItem {
  return {
    slideId: 'slide-1',
    projectId: 'project-1',
    title: '슬라이드 1',
    slideNum: 1,
    imageUrl: 'https://example.com/slide-1.png',
    script: 'server-initial',
    createdAt: '2026-02-22T00:00:00Z',
    updatedAt: '2026-02-22T00:00:00Z',
    ...overrides,
  };
}

describe('SlideWorkspace', () => {
  beforeEach(() => {
    projectScriptsData = undefined;
    scriptData = undefined;
    useSlideStore.setState({ slide: null });
  });

  afterEach(() => {
    useSlideStore.setState({ slide: null });
  });

  it('keeps local script when stale server script arrives for current slide', () => {
    const slide = buildSlide();
    const view = render(<SlideWorkspace slide={slide} />);

    expect(useSlideStore.getState().slide?.script).toBe('server-initial');

    act(() => {
      useSlideStore.getState().updateScript('client-latest');
    });
    expect(useSlideStore.getState().slide?.script).toBe('client-latest');

    projectScriptsData = {
      message: 'ok',
      projectId: 'project-1',
      scripts: [{ slideId: 'slide-1', scriptText: 'server-stale' }],
    };

    act(() => {
      view.rerender(<SlideWorkspace slide={slide} />);
    });

    expect(useSlideStore.getState().slide?.script).toBe('client-latest');
  });
});
