/**
 * @file Modal.tsx
 * @description 재사용 가능한 모달 컴포넌트
 *
 * 화면 중앙에 오버레이와 함께 모달을 표시합니다.
 * 외부 클릭이나 ESC 키로 닫을 수 있으며, 포커스 트랩을 지원합니다.
 */
import { type ReactNode, useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import clsx from 'clsx';

import CloseIcon from '@/assets/icons/icon-close.svg?react';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const modalId = useId();
  const titleId = useId();

  /**
   * 모달을 닫고 이전 포커스를 복원합니다.
   */
  const handleClose = useCallback(() => {
    onClose();
    lastFocusedElement.current?.focus();
  }, [onClose]);

  /**
   * 백드롭 클릭 시 모달을 닫습니다.
   */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        handleClose();
      }
    },
    [closeOnBackdropClick, handleClose],
  );

  // 모달 열릴 때 현재 포커스 저장 및 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, handleClose]);

  // 포커스 트랩
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 첫 번째 포커스 가능한 요소로 포커스 이동
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        id={modalId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={clsx(
          'relative w-full rounded-2xl border border-black/10 bg-white shadow-lg',
          sizeClasses[size],
          className,
        )}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-5 top-5 grid size-9 place-items-center rounded-lg text-gray-600 transition-opacity hover:opacity-70"
            aria-label="닫기"
          >
            <CloseIcon className="size-4" />
          </button>
        )}

        {/* Header */}
        {title && (
          <header className="px-6 pt-6">
            <h2 id={titleId} className="text-lg font-medium text-gray-900">
              {title}
            </h2>
          </header>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
