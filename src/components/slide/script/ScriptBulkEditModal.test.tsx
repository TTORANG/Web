import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ScriptBulkEditPreviewItem } from '@/hooks/useScriptBulkEdit';

import ScriptBulkEditModal from './ScriptBulkEditModal';

const baseProps = {
  isOpen: true,
  isSaving: false,
  isPreparingModal: false,
  selectedFileName: undefined,
  fileInputRef: createRef<HTMLInputElement>(),
  onClose: vi.fn(),
  onSave: vi.fn(),
  onOpenFilePicker: vi.fn(),
  onFileChange: vi.fn(),
  onScriptChange: vi.fn(),
};

const createPreviewItem = (
  overrides?: Partial<ScriptBulkEditPreviewItem>,
): ScriptBulkEditPreviewItem => ({
  slide: {
    slideId: '1',
    projectId: 'p1',
    title: null,
    slideNum: 1,
    imageUrl: 'https://example.com/slide-1.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    script: '',
  },
  index: 0,
  script: '대본',
  ...overrides,
});

describe('ScriptBulkEditModal', () => {
  it('uses 슬라이드 N when title is null', () => {
    const previewItems = [
      createPreviewItem({
        slide: {
          ...createPreviewItem().slide,
          title: null,
          slideNum: 3,
        },
      }),
    ];

    render(<ScriptBulkEditModal {...baseProps} previewItems={previewItems} />);

    expect(screen.getByText('슬라이드 3')).toBeInTheDocument();
    expect(screen.getByLabelText('슬라이드 3 대본')).toBeInTheDocument();
  });

  it('uses server title as-is when title exists', () => {
    const previewItems = [
      createPreviewItem({
        slide: {
          ...createPreviewItem().slide,
          title: '도입',
          slideNum: 1,
        },
      }),
    ];

    render(<ScriptBulkEditModal {...baseProps} previewItems={previewItems} />);

    expect(screen.getByText('도입')).toBeInTheDocument();
    expect(screen.getByLabelText('도입 대본')).toBeInTheDocument();
  });
});
