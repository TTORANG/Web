/**
 * @file Popover.tsx
 * @description 재사용 가능한 팝오버 컴포넌트
 *
 * 트리거 요소를 클릭하면 팝오버가 열리고, 외부 클릭이나 ESC 키로 닫힙니다.
 * 위치(top/bottom)와 정렬(start/end)을 지정할 수 있습니다.
 */
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import clsx from 'clsx';

type PopoverPosition = 'top' | 'bottom';
type PopoverAlign = 'start' | 'end';

interface PopoverProps {
  trigger: ReactElement | ((props: { isOpen: boolean }) => ReactElement);
  children: ReactNode | ((props: { close: () => void }) => ReactNode);
  position?: PopoverPosition;
  align?: PopoverAlign;
  className?: string;
  ariaLabel?: string;
}

export function Popover({
  trigger,
  children,
  position = 'top',
  align = 'end',
  className,
  ariaLabel,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const popoverId = useId();

  /**
   * 팝오버의 열림/닫힘 상태를 토글합니다.
   * 열릴 때 현재 포커스된 요소를 저장하여 닫힐 때 복원합니다.
   */
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        // 팝오버가 열릴 때 현재 포커스된 요소 저장
        lastFocusedElement.current = document.activeElement as HTMLElement;
      }
      return !prev;
    });
  }, []);

  /**
   * 팝오버를 닫습니다 (render prop용, ref 접근 없음)
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 팝오버 닫힐 때 이전에 포커스된 요소로 포커스 복원
  useEffect(() => {
    if (!isOpen && lastFocusedElement.current) {
      lastFocusedElement.current.focus();
      lastFocusedElement.current = null;
    }
  }, [isOpen]);

  // Escape 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // 팝오버 열릴 때 첫 번째 포커스 가능한 요소로 포커스 이동
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [isOpen]);

  const positionClasses = clsx({
    'bottom-full mb-2': position === 'top',
    'top-full mt-2': position === 'bottom',
  });

  const alignClasses = clsx({
    'left-0': align === 'start',
    'right-0': align === 'end',
  });

  return (
    <div ref={popoverRef} className="relative">
      <div
        ref={triggerRef}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
      >
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>

      {isOpen && (
        <div
          ref={contentRef}
          id={popoverId}
          role="dialog"
          aria-label={ariaLabel}
          aria-modal="false"
          className={clsx(
            'absolute z-50',
            positionClasses,
            alignClasses,
            'rounded-lg bg-white shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.05)]',
            className,
          )}
        >
          {typeof children === 'function' ? children({ close: close }) : children}
        </div>
      )}
    </div>
  );
}
