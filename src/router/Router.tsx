import { Navigate, createBrowserRouter } from 'react-router-dom';

import { Gnb, Layout, LoginButton, Logo, ShareButton } from '@/components/common';
import {
  DevTestPage,
  FdSlidePage,
  FdVideoPage,
  HomePage,
  InsightPage,
  SlidePage,
  VideoPage,
  VideoRecordPage,
} from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout right={<LoginButton />} scrollable />,
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
        right={
          <div className="flex items-center gap-8">
            <ShareButton />
            <LoginButton />
          </div>
        }
      />
    ),
    children: [
      { index: true, element: <Navigate to="slide" replace /> },
      { path: 'slide', element: <SlidePage /> },
      { path: 'video', element: <VideoPage /> },
      { path: 'insight', element: <InsightPage /> },
    ],
  },
  {
    path: '/feedback/slide/:projectId',
    element: (
      <Layout
        theme="dark"
        left={
          <>
            <Logo />
            <span className="text-body-m-bold text-black">발표 피드백</span>
          </>
        }
      />
    ),
    children: [{ index: true, element: <FdSlidePage /> }],
  },
  {
    path: '/:projectId/video/record',
    element: <VideoRecordPage />,
  },
  {
    path: '/feedback/video/:projectId',
    element: (
      <Layout
        theme="dark"
        left={
          <>
            <Logo />
            <span className="text-body-m-bold text-black">{'프로젝트 제목'}</span>
          </>
        }
      />
    ),
    children: [{ index: true, element: <FdVideoPage /> }],
  },
]);
