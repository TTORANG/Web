/**
 * @file Gnb.tsx
 * @description 글로벌 네비게이션 바 (탭 메뉴)
 *
 * 슬라이드/영상/인사이트 탭을 표시하며, 슬라이딩 인디케이터로 현재 위치를 나타냅니다.
 * 프로젝트 페이지에서만 표시됩니다.
 */
import { Link, useLocation, useParams } from 'react-router-dom';

import clsx from 'clsx';

import { TABS, getTabFromPathname, getTabPath } from '@/constants/navigation';

export function Gnb() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const activeTab = getTabFromPathname(location.pathname);
  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  if (!projectId) return null;

  return (
    <nav
      className="relative flex h-full w-full items-center justify-center md:h-15 md:w-[18.75rem]"
      role="tablist"
      aria-label="네비게이션 메뉴"
    >
      {TABS.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <Link
            key={key}
            to={getTabPath(projectId, key)}
            role="tab"
            id={`tab-${key}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${key}`}
            className={clsx(
              'flex h-full min-w-0 flex-1 items-end justify-center px-2 pb-3 pt-3 text-body-m-bold whitespace-nowrap transition-colors duration-300 md:w-25 md:flex-none md:px-2.5 md:pb-4 md:pt-4',
              isActive ? 'text-main' : 'text-gray-600',
            )}
          >
            <span className="truncate">{label}</span>
          </Link>
        );
      })}

      {/* 슬라이딩 인디케이터 */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-[calc(100%/3)] bg-main transition-transform duration-300 ease-out md:w-25"
        style={{ transform: `translateX(${safeActiveIndex * 100}%)` }}
      />
    </nav>
  );
}
