import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

type PopoverPosition = 'top' | 'bottom';
type PopoverAlign = 'start' | 'end';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  position?: PopoverPosition;
  align?: PopoverAlign;
  className?: string;
}

export function Popover({
  trigger,
  children,
  position = 'top',
  align = 'end',
  className,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Escape 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

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
      <div onClick={handleToggle}>{trigger}</div>

      {isOpen && (
        <div
          className={clsx(
            'absolute z-50',
            positionClasses,
            alignClasses,
            'rounded-lg bg-white shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.05)]',
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
