/**
 * @file useFeedbackRoute.ts
 * @description 피드백 라우트 공통 로직 훅
 *
 * FeedbackSlidePageRoute / FeedbackVideoPageRoute가 공유하는
 * 익명 세션 초기화, pageView 기록, exit 트래킹 로직을 통합합니다.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { recordPageView } from '@/api/endpoints/analytics';
import { useSharedContent } from '@/hooks/queries/useShares';
import { useExitTracker } from '@/hooks/useExitTracker';
import type { ShareExitSnapshot } from '@/pages/feedback/useFeedbackVideo';
import { useAuthStore } from '@/stores/authStore';
import { userFromAccessToken } from '@/utils/auth';

export function useFeedbackRoute() {
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get('shareToken') ?? '';

  const { data, isLoading, isError } = useSharedContent(shareToken || undefined);

  const [exitSnapshot, setExitSnapshot] = useState<ShareExitSnapshot | null>(null);
  const onShareExitSnapshotChange = useCallback((snapshot: ShareExitSnapshot) => {
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
      ...exitSnapshot,
    };
  }, [shareToken, data, exitSnapshot]);

  useExitTracker(buildExitPayload);

  return { shareToken, data, isLoading, isError, onShareExitSnapshotChange };
}
