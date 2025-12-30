import clsx from 'clsx';

import { TABS, type Tab } from '../../constants/navigation';

interface GNBProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export function GNB({ activeTab = 'slide', onTabChange }: GNBProps) {
  return (
    <nav
      className="absolute left-1/2 flex h-15 -translate-x-1/2 items-center justify-center"
      role="tablist"
      aria-label="네비게이션 메뉴"
    >
      {TABS.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange?.(key)}
            className={clsx(
              `flex h-full w-25 items-end justify-center px-2.5 pb-4 pt-4 text-body-m-bold border-b-2`,
              {
                'border-main text-main': isActive,
                'border-transparent text-gray-600': !isActive,
              },
            )}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
