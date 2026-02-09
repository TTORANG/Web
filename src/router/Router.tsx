import { Navigate, createBrowserRouter } from 'react-router-dom';

import {
  Gnb,
  Layout,
  LoginButton,
  Logo,
  PresentationTitleEditor,
  ShareButton,
} from '@/components/common';
// TODO: 컴포넌트 교체
import FeedbackHeaderCenter from '@/components/feedback/FeedbackHeaderCenter';
import FeedbackHeaderLeft from '@/components/feedback/FeedbackHeaderLeft';
import {
  DevTestPage,
  FdSlidePage,
  FdVideoPage,
  HomePage,
  InsightPage,
  OAuthCallbackPage,
  SlidePage,
  VideoListPage,
  VideoRecordPage,
  // VideoDetailPage
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
    path: '/auth/callback',
    element: <OAuthCallbackPage />,
  },
  {
    path: '/:projectId',
    element: (
      <Layout
        left={
          <>
            <Logo />
            <PresentationTitleEditor />
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
      { path: 'insight', element: <InsightPage /> },
      { path: 'videos', element: <VideoListPage /> },
    ],
  },
  {
    path: '/feedback/slide/:projectId',
    element: (
      <Layout theme="dark" left={<FeedbackHeaderLeft />} center={<FeedbackHeaderCenter />} />
    ),
    children: [{ index: true, element: <FdSlidePage /> }],
  },
  // {
  //   path: '/video/:videoId',
  //   element: <VideoDetailPage />,
  // },
  {
    path: '/:projectId/video/record',
    element: <VideoRecordPage />,
  },
  {
    path: '/feedback/video/:projectId',
    element: (
      <Layout theme="dark" left={<FeedbackHeaderLeft />} center={<FeedbackHeaderCenter />} />
    ),
    children: [{ index: true, element: <FdVideoPage /> }],
  },
]);
