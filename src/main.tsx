import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { LoginButton, Logo } from '@/components/common';
import { Gnb } from '@/components/layout/Gnb';
import { Layout } from '@/components/layout/Layout';
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
            <Logo variant="icon" />
            <span className="text-body-m-bold text-gray-800">내 발표</span>
          </>
        }
        center={<Gnb />}
        right={<LoginButton />}
      />
    ),
    children: [
      { index: true, element: <Navigate to="slide/1" replace /> },
      { path: 'slide/:slideId?', element: <SlidePage /> },
      { path: 'video', element: <VideoPage /> },
      { path: 'insight', element: <InsightPage /> },
    ],
  },
]);

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
