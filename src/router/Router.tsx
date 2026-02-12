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
  FeedbackSlidePageRoute,
  FeedbackVideoPageRoute,
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
      { path: 'videos/:videoId', element: <VideoDetailPage /> },
    ],
  },
  {
    path: '/feedback/slide/:projectId',
    element: (
      <Layout theme="dark" left={<FeedbackHeaderLeft />} center={<FeedbackHeaderCenter />}>
        <FeedbackSlidePageRoute />
      </Layout>
    ),
  },
  {
    path: '/feedback/video/:projectId',
    element: (
      <Layout theme="dark" left={<FeedbackHeaderLeft />} center={<FeedbackHeaderCenter />}>
        <FeedbackVideoPageRoute />
      </Layout>
    ),
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
