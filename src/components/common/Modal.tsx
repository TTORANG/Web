/**
 * @file Modal.tsx
 * @description 재사용 가능한 모달 컴포넌트
 *
 * 화면 중앙에 오버레이와 함께 모달을 표시합니다.
 * 외부 클릭이나 ESC 키로 닫을 수 있으며, 포커스 트랩을 지원합니다.
 */
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import clsx from 'clsx';

import CloseIcon from '@/assets/icons/icon-close.svg?react';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 닫힘 애니메이션 완료 후 호출되는 콜백 */
  onAfterClose?: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  /** 콘텐츠 영역 패딩 제거 (기본값: false) */
  noPadding?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  onAfterClose,
  title,
  children,
  size = 'md',
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  noPadding = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const mouseDownTarget = useRef<EventTarget | null>(null);
  const modalId = useId();
  const titleId = useId();

  // 렌더링 상태 (열릴 때 true, 닫힘 애니메이션 완료 후 false)
  const [shouldRender, setShouldRender] = useState(isOpen);
  const isClosing = shouldRender && !isOpen;

  // isOpen이 true가 되면 렌더링 시작
  if (isOpen && !shouldRender) {
    setShouldRender(true);
  }

  /**
   * 닫힘 애니메이션 완료 시 호출
   */
  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent) => {
      // backdrop의 애니메이션만 처리 (자식 요소 제외)
      if (e.target === backdropRef.current && !isOpen) {
        setShouldRender(false);
        onAfterClose?.();
      }
    },
    [isOpen, onAfterClose],
  );

  /**
   * 모달을 닫고 이전 포커스를 복원합니다.
   */
  const handleClose = useCallback(() => {
    onClose();
    lastFocusedElement.current?.focus();
  }, [onClose]);

  /**
   * mousedown 위치 저장
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDownTarget.current = e.target;
  }, []);

  /**
   * 백드롭 클릭 시 모달을 닫습니다.
   * mousedown과 mouseup 모두 백드롭에서 발생해야 닫힙니다.
   */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      const isBackdrop = e.target === backdropRef.current;
      const mouseDownOnBackdrop = mouseDownTarget.current === backdropRef.current;
      if (closeOnBackdropClick && isBackdrop && mouseDownOnBackdrop) {
        handleClose();
      }
      mouseDownTarget.current = null;
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

  if (!shouldRender) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/65',
        isClosing ? 'animate-fade-out' : 'animate-fade-in',
      )}
      onMouseDown={handleMouseDown}
      onClick={handleBackdropClick}
      onAnimationEnd={handleAnimationEnd}
      role="presentation"
    >
      <div
        ref={modalRef}
        id={modalId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={clsx(
          'relative w-full rounded-xl bg-white shadow-lg',
          isClosing ? 'animate-zoom-out' : 'animate-zoom-in',
          sizeClasses[size],
          className,
        )}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-5 top-5 grid size-9 place-items-center rounded-lg text-gray-600 transition-all hover:bg-gray-100 active:bg-gray-200"
            aria-label="닫기"
          >
            <CloseIcon className="size-4" />
          </button>
        )}

        {/* Header */}
        {title && (
          <header className="px-6 pt-5">
            <h2 id={titleId} className="text-body-l-bold text-gray-800">
              {title}
            </h2>
          </header>
        )}

        {/* Content */}
        <div className={noPadding ? '' : 'p-6'}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
