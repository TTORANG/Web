/**
 * @file Dropdown.tsx
 * @description 재사용 가능한 드롭다운 메뉴 컴포넌트
 *
 * 트리거 요소를 클릭하면 드롭다운 메뉴가 열리고, 외부 클릭이나 ESC 키로 닫힙니다.
 * 키보드 네비게이션(화살표 키, Enter)을 지원합니다.
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

type DropdownPosition = 'top' | 'bottom';
type DropdownAlign = 'start' | 'end';

export interface DropdownItem {
  id: string;
  label: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  /** 현재 선택된 항목인지 여부 */
  selected?: boolean;
}

interface DropdownProps {
  trigger: ReactElement | ((props: { isOpen: boolean }) => ReactElement);
  items: DropdownItem[];
  position?: DropdownPosition;
  align?: DropdownAlign;
  className?: string;
  menuClassName?: string;
  ariaLabel?: string;
}

export function Dropdown({
  trigger,
  items,
  position = 'bottom',
  align = 'start',
  className,
  menuClassName,
  ariaLabel,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const menuId = useId();

  const enabledItems = items.filter((item) => !item.disabled);

  /**
   * 드롭다운의 열림/닫힘 상태를 토글합니다.
   */
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        lastFocusedElement.current = document.activeElement as HTMLElement;
        setFocusedIndex(-1);
      }
      return !prev;
    });
  }, []);

  /**
   * 드롭다운을 닫습니다.
   */
  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  /**
   * 메뉴 항목 클릭 핸들러
   */
  const handleItemClick = useCallback(
    (item: DropdownItem) => {
      if (item.disabled) return;
      item.onClick();
      close();
    },
    [close],
  );

  // 드롭다운 닫힐 때 이전에 포커스된 요소로 포커스 복원
  useEffect(() => {
    if (!isOpen && lastFocusedElement.current) {
      lastFocusedElement.current.focus();
      lastFocusedElement.current = null;
    }
  }, [isOpen]);

  // Escape 키로 닫기 및 키보드 네비게이션
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          e.stopImmediatePropagation();
          close();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            return prev < enabledItems.length - 1 ? prev + 1 : 0;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            return prev > 0 ? prev - 1 : enabledItems.length - 1;
          });
          break;
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0 && focusedIndex < enabledItems.length) {
            e.preventDefault();
            handleItemClick(enabledItems[focusedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, close, focusedIndex, enabledItems, handleItemClick]);

  // 포커스 인덱스 변경 시 해당 항목에 포커스
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  const positionClasses = clsx({
    'bottom-full mb-2': position === 'top',
    'top-full mt-2': position === 'bottom',
  });

  const alignClasses = clsx({
    'left-0': align === 'start',
    'right-0': align === 'end',
  });

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
      >
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          className={clsx(
            'absolute z-50 min-w-30 overflow-hidden',
            positionClasses,
            alignClasses,
            'rounded-lg border border-gray-200 bg-white',
            'shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.1)]',
            menuClassName,
          )}
        >
          {items.map((item) => {
            const enabledIndex = enabledItems.findIndex((i) => i.id === item.id);
            const isFocused = enabledIndex === focusedIndex;

            return (
              <button
                key={item.id}
                ref={(el) => {
                  if (enabledIndex >= 0) {
                    itemRefs.current[enabledIndex] = el;
                  }
                }}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => {
                  if (!item.disabled) {
                    setFocusedIndex(enabledIndex);
                  }
                }}
                className={clsx(
                  'w-full whitespace-nowrap px-5 py-3 text-left text-body-m-bold transition-colors focus:outline-none',
                  {
                    'cursor-not-allowed opacity-50': item.disabled,
                    'text-error': item.variant === 'danger' && !item.selected,
                    'text-gray-800': item.variant !== 'danger' && !item.selected,
                    'bg-gray-100': !item.disabled && isFocused && !item.selected,
                    'bg-main-variant1 text-white': item.selected,
                    'active:bg-main-variant1 active:text-white': !item.disabled && !item.selected,
                  },
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
