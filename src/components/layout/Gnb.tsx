import { Link, useParams } from 'react-router-dom';

import clsx from 'clsx';

import { DEFAULT_TAB, TABS, type Tab, getTabPath } from '../../constants/navigation';

interface GnbProps {
  activeTab?: Tab;
}

export function Gnb({ activeTab = DEFAULT_TAB }: GnbProps) {
  const { presentationId = '' } = useParams<{ presentationId: string }>();

  return (
    <nav
      className="flex h-15 items-center justify-center"
      role="tablist"
      aria-label="네비게이션 메뉴"
    >
      {TABS.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <Link
            key={key}
            to={getTabPath(presentationId, key)}
            role="tab"
            id={`tab-${key}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${key}`}
            className={clsx(
              'flex h-full w-25 items-end justify-center px-2.5 pb-4 pt-4 text-body-m-bold border-b-2',
              {
                'border-main text-main': isActive,
                'border-transparent text-gray-600': !isActive,
              },
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
