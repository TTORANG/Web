import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './App';
import HomePage from './pages/HomePage';
import InsightPage from './pages/InsightPage';
import SlidePage from './pages/SlidePage';
import VideoPage from './pages/VideoPage';
import './styles/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
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
]);

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
