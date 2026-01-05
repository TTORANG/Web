import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/api';
import { LoginButton, Logo } from '@/components/common';
import { Gnb } from '@/components/layout/Gnb';
import { Layout } from '@/components/layout/Layout';
import { DEFAULT_SLIDE_ID } from '@/constants/navigation';
import { HomePage, InsightPage, SlidePage, VideoPage } from '@/pages';
import '@/styles/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout right={<LoginButton />} />,
    children: [{ index: true, element: <HomePage /> }],
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
]);

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* 개발 중에만 보이는 Query 디버깅 도구 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
