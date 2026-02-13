import { Suspense, lazy, type ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import {
  Gnb,
  Layout,
  LoginButton,
  Logo,
  PresentationTitleEditor,
  ShareButton,
  Spinner,
} from '@/components/common';

const DevTestPage = lazy(() => import('@/pages/dev-test/DevTestPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const InsightPage = lazy(() => import('@/pages/InsightPage'));
const OAuthCallbackPage = lazy(() => import('@/pages/OAuthCallbackPage'));
const SharePage = lazy(() => import('@/pages/SharePage'));
const SlidePage = lazy(() => import('@/pages/SlidePage'));
const VideoListPage = lazy(() => import('@/pages/VideoListPage'));
const VideoRecordPage = lazy(() => import('@/pages/VideoRecordPage'));
const VideoDetailPage = lazy(() => import('@/pages/VideoDetailPage'));
const FeedbackHeaderCenter = lazy(() => import('@/components/feedback/FeedbackHeaderCenter'));
const FeedbackHeaderLeft = lazy(() => import('@/components/feedback/FeedbackHeaderLeft'));

function withRouteSuspense(element: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size={36} />
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout right={<LoginButton />} scrollable />,
    children: [{ index: true, element: withRouteSuspense(<HomePage />) }],
  },
  {
    path: '/dev',
    element: withRouteSuspense(<DevTestPage />),
  },
  {
    path: '/auth/callback',
    element: withRouteSuspense(<OAuthCallbackPage />),
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
          <div className="flex items-center gap-3 md:gap-8">
            <ShareButton />
            <LoginButton />
          </div>
        }
      />
    ),
    children: [
      { index: true, element: <Navigate to="slide" replace /> },
      { path: 'slide', element: withRouteSuspense(<SlidePage />) },
      { path: 'insight', element: withRouteSuspense(<InsightPage />) },
      { path: 'videos', element: withRouteSuspense(<VideoListPage />) },
      { path: 'videos/:videoId', element: withRouteSuspense(<VideoDetailPage />) },
    ],
  },
  {
    path: '/:projectId/video/record',
    element: withRouteSuspense(<VideoRecordPage />),
  },

  {
    path: '/share/:shareToken',
    element: (
      <Layout
        theme="dark"
        left={withRouteSuspense(<FeedbackHeaderLeft />)}
        center={withRouteSuspense(<FeedbackHeaderCenter />)}
      />
    ),
    children: [{ index: true, element: withRouteSuspense(<SharePage />) }],
  },
]);
