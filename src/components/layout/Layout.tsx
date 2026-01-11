/**
 * @file Layout.tsx
 * @description 공통 레이아웃 컴포넌트
 *
 * 고정 헤더와 메인 콘텐츠 영역으로 구성됩니다.
 * 헤더는 좌측(로고), 중앙(탭), 우측(로그인, 공유) 슬롯을 제공합니다.
 */
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { Logo } from '@/components/common';

import { LoginModal } from '../auth/login-modal';

interface LayoutProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function Layout({ left, center, right }: LayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <header className="fixed top-0 right-0 left-0 z-50 flex h-15 items-center justify-between border-b border-gray-200 bg-white px-18">
        <div className="flex items-center gap-6">{left ?? <Logo />}</div>
        <div className="absolute left-1/2 -translate-x-1/2">{center}</div>
        <div className="flex items-center gap-8">{right}</div>
      </header>

      <main className="mt-15 h-[calc(100vh-3.75rem)] overflow-y-auto">
        {/* Outlet이 들어가는 영역(= 네 컨텐츠)이 이제 정확한 높이를 가짐 */}
        <div className="h-full">
          <Outlet />
        </div>
      </main>
      <LoginModal />
    </div>
  );
}
