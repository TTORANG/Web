import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { Layout } from '@/components/layout/Layout';
import { HomePage, InsightPage, SlidePage, VideoPage } from '@/pages';
import '@/styles/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/:projectId',
    element: <Layout />,
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
