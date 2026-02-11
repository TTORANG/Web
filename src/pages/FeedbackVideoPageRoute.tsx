/**
 * @file FeedbackVideoPageRoute.tsx
 * @description /feedback/video/:projectId 라우트 전용 래퍼
 *
 * shareToken 기반으로 공유 콘텐츠를 로드한 후 FeedbackVideoPage에 전달합니다.
 * SharePage를 거치지 않는 직접 접근 경로를 처리합니다.
 */
import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { recordPageView } from '@/api/endpoints/analytics';
import { Spinner } from '@/components/common';
import { useSharedContent } from '@/hooks/queries/useShares';
import { useExitTracker } from '@/hooks/useExitTracker';
import type { ShareExitSnapshot } from '@/pages/feedback/useFeedbackVideo';
import { useAuthStore } from '@/stores/authStore';
import { userFromAccessToken } from '@/utils/auth';

import FeedbackVideoPage from './FeedbackVideoPage';

export default function FeedbackVideoPageRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get('shareToken') ?? '';

  const { data, isLoading, isError } = useSharedContent(shareToken || undefined);

  const [exitSnapshot, setExitSnapshot] = useState<ShareExitSnapshot | null>(null);
  const handleShareExitSnapshotChange = useCallback((snapshot: ShareExitSnapshot) => {
    setExitSnapshot(snapshot);
  }, []);

  // 익명 세션 초기화
  useEffect(() => {
    if (!data?.sessionInfo) return;

    const { user } = useAuthStore.getState();
    if (user?.sessionId) return;

    const { sessionId, tokens } = data.sessionInfo;
    const { accessToken, refreshToken } = tokens;

    if (!accessToken || !refreshToken) return;

    const derivedUser = userFromAccessToken(accessToken, sessionId);
    useAuthStore.getState().setAuth({
      user: derivedUser,
      accessToken,
      refreshToken,
      anonymousSessionId: sessionId ?? null,
    });
  }, [data]);

  // pageView 기록
  useEffect(() => {
    if (!shareToken || !data) return;

    const sentKey = `pageview:${shareToken}`;
    if (sessionStorage.getItem(sentKey) === '1') return;
    sessionStorage.setItem(sentKey, '1');

    void recordPageView({ shareToken }).catch(() => {
      sessionStorage.removeItem(sentKey);
    });
  }, [shareToken, data]);

  // exit 트래킹
  const buildExitPayload = useCallback(() => {
    if (!shareToken || !data) return null;
    return {
      shareToken,
      ...(exitSnapshot?.lastSlideId != null ? { lastSlideId: exitSnapshot.lastSlideId } : {}),
      ...(exitSnapshot?.lastVideoId != null ? { lastVideoId: exitSnapshot.lastVideoId } : {}),
      ...(exitSnapshot?.lastVideoTimeMs != null
        ? { lastVideoTimeMs: exitSnapshot.lastVideoTimeMs }
        : {}),
    };
  }, [shareToken, data, exitSnapshot]);

  useExitTracker(buildExitPayload);

  if (!shareToken && !projectId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        잘못된 접근입니다.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        공유 콘텐츠를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <FeedbackVideoPage
      sharedContent={data}
      onShareExitSnapshotChange={handleShareExitSnapshotChange}
    />
  );
}
