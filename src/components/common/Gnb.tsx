/**
 * @file Gnb.tsx
 * @description 글로벌 네비게이션 바 (탭 메뉴)
 *
 * 슬라이드/영상/인사이트 탭을 표시하며, 슬라이딩 인디케이터로 현재 위치를 나타냅니다.
 * 프로젝트 페이지에서만 표시됩니다.
 */
import { Link, useLocation, useParams } from 'react-router-dom';

import clsx from 'clsx';

import { TABS, getTabFromPathname, getTabPath } from '@/constants/navigation.ts';

export function Gnb() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const activeTab = getTabFromPathname(location.pathname);
  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);

  if (!projectId) return null;

  return (
    <nav
      className="relative flex h-15 items-center justify-center"
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
              'flex h-full w-25 items-end justify-center px-2.5 pb-4 pt-4 text-body-m-bold transition-colors duration-300',
              isActive ? 'text-main' : 'text-gray-600',
            )}
          >
            {label}
          </Link>
        );
      })}

      {/* 슬라이딩 인디케이터 */}
      <div
        className="absolute bottom-0 h-0.5 w-25 bg-main transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${(activeIndex - 1) * 100}%)` }}
      />
    </nav>
  );
}
