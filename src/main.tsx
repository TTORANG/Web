import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { queryClient } from '@/api';
import { LoginButton, Logo } from '@/components/common';
import { Gnb } from '@/components/layout/Gnb';
import { Layout } from '@/components/layout/Layout';
import { DEFAULT_SLIDE_ID } from '@/constants/navigation';
import { DevTestPage, FdSlidePage, HomePage, InsightPage, SlidePage, VideoPage } from '@/pages';
import '@/styles/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout right={<LoginButton />} />,
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: '/dev',
    element: <DevTestPage />,
  },
  {
    path: '/:projectId',
    element: (
      <Layout
        left={
          <>
            <Logo />
            <span className="text-body-m-bold text-gray-800">내 발표</span>
          </>
        }
        center={<Gnb />}
        right={<LoginButton />}
      />
    ),
    children: [
      { index: true, element: <Navigate to={`slide/${DEFAULT_SLIDE_ID}`} replace /> },
      { path: 'slide/:slideId', element: <SlidePage /> },
      { path: 'video', element: <VideoPage /> },
      { path: 'insight', element: <InsightPage /> },
    ],
  },
  {
    path: '/feedback',
    element: (
      <Layout
        left={
          <>
            <Logo />
            <span className="text-body-m-bold text-gray-800">내 발표</span>
          </>
        }
        right={<LoginButton />}
      />
    ),
    children: [
      { index: true, element: <Navigate to={`fslide/${DEFAULT_SLIDE_ID}`} replace /> },
      { path: 'fslide/:slideId', element: <FdSlidePage /> },
    ],
  },
]);

/**
 * MSW 활성화 (개발 환경 전용)
 *
 * VITE_API_MOCKING=true 환경변수가 설정된 경우에만 MSW를 시작합니다.
 * npm run dev:local 시 자동으로 활성화됩니다.
 */
async function enableMocking() {
  if (import.meta.env.VITE_API_MOCKING !== 'true') {
    return;
  }

  const { worker } = await import('@/mocks/browser');

  return worker.start({
    onUnhandledRequest: 'bypass', // 모킹되지 않은 요청은 그대로 통과
  });
}

enableMocking().then(() => {
  createRoot(document.querySelector('#root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-center" closeButton />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
