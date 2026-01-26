/**
 * @file Layout.tsx
 * @description 공통 레이아웃 컴포넌트
 *
 * 고정 헤더와 메인 콘텐츠 영역으로 구성됩니다.
 * 헤더는 좌측(로고), 중앙(탭), 우측(로그인, 공유) 슬롯을 제공합니다.
 */
import { type ReactNode, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { LoginModal } from '@/components/auth/login-modal';
import { Logo } from '@/components/common';
import { ShareModal } from '@/components/share/share-modal';
import { useThemeStore } from '@/stores/themeStore';

interface LayoutProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** 명시적 테마 (설정 시 로컬스토리지 무시) */
  theme?: 'light' | 'dark';
  /**
   * 메인 영역 스크롤 여부
   * - true: 전체 페이지 스크롤 허용 (홈 등)
   * - false: 뷰포트 고정, 내부 스크롤 (슬라이드, 피드백 등)
   * @default false
   */
  scrollable?: boolean;
  children?: ReactNode;
}

export function Layout({ left, center, right, theme, scrollable = false, children }: LayoutProps) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const appliedTheme = theme ?? resolvedTheme;

  // 테마가 변경되거나 오버라이드될 때 document.documentElement에 적용 (모달 등 포탈 지원)
  useEffect(() => {
    document.documentElement.dataset.theme = appliedTheme;

    // cleanup: 컴포넌트 언마운트 시 전역 테마로 복구 (오버라이드 했던 경우)
    return () => {
      if (theme) {
        document.documentElement.dataset.theme = useThemeStore.getState().resolvedTheme;
      }
    };
  }, [appliedTheme, theme]);

  return (
    <div
      data-theme={appliedTheme}
      className={`bg-gray-100 ${scrollable ? 'min-h-screen' : 'h-screen overflow-hidden'}`}
    >
      <header className="fixed top-0 right-0 left-0 z-50 flex h-15 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-18">
        <div className="flex items-center gap-6">{left ?? <Logo />}</div>
        <div className="absolute left-1/2 -translate-x-1/2">{center}</div>
        <div className="flex items-center gap-8">{right}</div>
      </header>

      <main
        className={`mt-15 ${scrollable ? 'min-h-[calc(100vh-3.75rem)]' : 'h-[calc(100vh-3.75rem)] overflow-hidden'}`}
      >
        <div className="h-full">{children || <Outlet />}</div>
      </main>
      <LoginModal />
      <ShareModal />
    </div>
  );
}
