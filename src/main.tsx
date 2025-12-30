import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './App';
import InsightPage from './pages/InsightPage';
import SlidePage from './pages/SlidePage';
import VideoPage from './pages/VideoPage';
import './styles/index.css';

const router = createBrowserRouter([
  {
    path: '/:presentationId',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="slide/1" replace /> },
      { path: 'slide/:slideIndex?', element: <SlidePage /> },
      { path: 'video', element: <VideoPage /> },
      { path: 'insight', element: <InsightPage /> },
    ],
  },
  // 임시: 루트 접근 시 데모 발표로 리다이렉트
  { path: '/', element: <Navigate to="/demo/slide/1" replace /> },
]);

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
