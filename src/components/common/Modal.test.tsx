import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  describe('when isOpen is false', () => {
    it('does not render anything', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>,
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('when isOpen is true', () => {
    it('renders children', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Modal Content</p>
        </Modal>,
      );
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Title">
          <p>Content</p>
        </Modal>,
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('has dialog role and aria-modal', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="My Title">
          <p>Content</p>
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });

  describe('close behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>,
      );
      const closeButton = screen.getByRole('button', { name: '닫기' });
      await user.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose on ESC key', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>,
      );
      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on ESC when closeOnEscape is false', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} closeOnEscape={false}>
          <p>Content</p>
        </Modal>,
      );
      await user.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('close button visibility', () => {
    it('shows close button by default', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>,
      );
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
          <p>Content</p>
        </Modal>,
      );
      expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
    });
  });

  describe('size classes', () => {
    it('applies md size class by default', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-md');
    });

    it('applies sm size class', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="sm">
          <p>Content</p>
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-sm');
    });

    it('applies lg size class', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="lg">
          <p>Content</p>
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-lg');
    });
  });
});
