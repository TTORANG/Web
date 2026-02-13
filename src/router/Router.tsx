import { Navigate, createBrowserRouter } from 'react-router-dom';

import {
  Gnb,
  Layout,
  LoginButton,
  Logo,
  PresentationTitleEditor,
  ShareButton,
} from '@/components/common';
import FeedbackHeaderCenter from '@/components/feedback/FeedbackHeaderCenter';
import FeedbackHeaderLeft from '@/components/feedback/FeedbackHeaderLeft';
import {
  DevTestPage,
  HomePage,
  InsightPage,
  OAuthCallbackPage,
  SharePage,
  SlidePage,
  VideoListPage,
  VideoRecordPage,
} from '@/pages';
import VideoDetailPage from '@/pages/VideoDetailPage';

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
        mobileTwoLineHeader
        left={
          <>
            <Logo />
            <PresentationTitleEditor />
          </>
        }
        center={<Gnb />}
        right={
          <div className="flex max-w-full items-center gap-2 md:gap-8">
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
      { path: 'videos/:videoId', element: <VideoDetailPage /> },
    ],
  },
  {
    path: '/:projectId/video/record',
    element: <VideoRecordPage />,
  },

  {
    path: '/share/:shareToken',
    element: (
      <Layout theme="dark" left={<FeedbackHeaderLeft />} center={<FeedbackHeaderCenter />} />
    ),
    children: [{ index: true, element: <SharePage /> }],
  },
]);
