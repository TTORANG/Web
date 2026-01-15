/**
 * @file Layout.tsx
 * @description 공통 레이아웃 컴포넌트
 *
 * 고정 헤더와 메인 콘텐츠 영역으로 구성됩니다.
 * 헤더는 좌측(로고), 중앙(탭), 우측(로그인, 공유) 슬롯을 제공합니다.
 */
import { type ReactNode, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { LoginModal } from '@/components/auth/login-modal';
import { Logo } from '@/components/common/index.ts';
import { ShareModal } from '@/components/share/share-modal';
import type { ThemeMode } from '@/types/theme.ts';

const THEME_STORAGE_KEY = 'ttorang-theme';

/**
 * 로컬스토리지 + 시스템 설정 기반으로 실제 테마 계산
 */
function getResolvedTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  if (stored === 'dark') return 'dark';
  if (stored === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

interface LayoutProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** 명시적 테마 (설정 시 로컬스토리지 무시) */
  theme?: 'light' | 'dark';
}

export function Header({ left, center, right, theme }: LayoutProps) {
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    () => theme ?? getResolvedTheme(),
  );

  useEffect(() => {
    if (theme) return;

    const syncTheme = () => setResolvedTheme(getResolvedTheme());

    const handleStorage = syncTheme;
    window.addEventListener('storage', handleStorage);

    const handleThemeChange = syncTheme;
    window.addEventListener('theme-change', handleThemeChange);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'auto') {
        syncTheme();
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('theme-change', handleThemeChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [theme]);

  const appliedTheme = theme ?? resolvedTheme;

  return (
    <div data-theme={appliedTheme} className="h-screen overflow-hidden bg-gray-100">
      <header className="fixed top-0 right-0 left-0 z-50 flex h-15 items-center justify-between border-b border-gray-200 bg-white px-18">
        <div className="flex items-center gap-6">{left ?? <Logo />}</div>
        <div className="absolute left-1/2 -translate-x-1/2">{center}</div>
        <div className="flex items-center gap-8">{right}</div>
      </header>

      <main className="mt-15 h-[calc(100vh-3.75rem)] overflow-hidden">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
      <LoginModal />
      <ShareModal />
    </div>
  );
}
