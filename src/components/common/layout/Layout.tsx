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
  /**
   * 프로젝트 페이지 전용 모바일/태블릿(<1024px) 2줄 헤더 사용 여부
   * - 데스크톱(>=1024px)은 기존 1줄 헤더 유지
   */
  mobileTwoLineHeader?: boolean;
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

export function Layout({
  left,
  center,
  right,
  mobileTwoLineHeader = false,
  theme,
  scrollable = false,
  children,
}: LayoutProps) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const appliedTheme = theme ?? resolvedTheme;
  const hasMobileTwoLineHeader = mobileTwoLineHeader && Boolean(center);
  // fixed header 높이만큼 main에 padding-top을 주고,
  // main 자체는 viewport 높이를 유지해 별도 calc() 없이 레이아웃을 맞춘다.
  const mainPaddingTopClass = hasMobileTwoLineHeader ? 'pt-[6.75rem] md:pt-15' : 'pt-15';
  const mainViewportClass = scrollable ? 'min-h-screen' : 'h-screen overflow-hidden';

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
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white">
        {hasMobileTwoLineHeader ? (
          <>
            <div className="flex h-15 items-center justify-between px-4 md:hidden">
              <div className="flex min-w-0 flex-1 items-center gap-4">{left ?? <Logo />}</div>
              <div className="flex shrink-0 items-center gap-3">{right}</div>
            </div>
            <div className="h-12 border-t border-gray-200 px-2 md:hidden">
              <div className="h-full">{center}</div>
            </div>
            <div className="hidden h-15 items-center justify-between px-4 md:flex md:px-18">
              <div className="flex min-w-0 items-center gap-6">{left ?? <Logo />}</div>
              <div className="absolute left-1/2 -translate-x-1/2">{center}</div>
              <div className="flex items-center gap-8">{right}</div>
            </div>
          </>
        ) : (
          <div className="flex h-15 items-center justify-between px-4 md:px-18">
            <div className="flex min-w-0 items-center gap-6">{left ?? <Logo />}</div>
            <div className="absolute left-1/2 -translate-x-1/2">{center}</div>
            <div className="flex items-center gap-8">{right}</div>
          </div>
        )}
      </header>

      <main className={`${mainPaddingTopClass} bg-gray-100 ${mainViewportClass}`}>
        <div className="h-full">{children || <Outlet />}</div>
      </main>
      <LoginModal />
      <ShareModal />
    </div>
  );
}
