import { Outlet } from 'react-router-dom';

import { Gnb } from './Gnb';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-15 items-center justify-between border-b border-gray-200 bg-white px-18">
        <div className="flex items-center">로고</div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <Gnb />
        </div>
        <div className="flex items-center">로그인</div>
      </header>
      <main className="pt-15">
        <Outlet />
      </main>
    </div>
  );
}
