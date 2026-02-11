/**
 * @file SharePage.tsx
 * @description 공유 링크 진입 페이지
 *
 * shareToken으로 공유 콘텐츠를 조회한 뒤,
 * scope에 따라 슬라이드 피드백 또는 비디오 피드백 페이지로 분기합니다.
 */
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { recordPageView } from '@/api/endpoints/analytics';
import { Spinner } from '@/components/common';
import { useSharedContent } from '@/hooks/queries/useShares';
import { useExitTracker } from '@/hooks/useExitTracker';
import type { ShareExitSnapshot } from '@/pages/feedback/useFeedbackVideo';
import { useAuthStore } from '@/stores/authStore';
import { userFromAccessToken } from '@/utils/auth';

import FeedbackSlidePage from './FeedbackSlidePage';
import FeedbackVideoPage from './FeedbackVideoPage';

interface ShareExitSnapshotState {
  shareToken: string;
  snapshot: ShareExitSnapshot;
}

export default function SharePage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data, isLoading, isError } = useSharedContent(shareToken);
  // 하위 페이지(FeedbackVideo/FeedbackSlide)가 보고하는 마지막 시청 위치를 저장합니다.
  // 실제 `/analytics/exit` 전송은 SharePage 한 곳에서만 담당합니다.
  const [exitSnapshotState, setExitSnapshotState] = useState<ShareExitSnapshotState | null>(null);
  const handleShareExitSnapshotChange = useCallback(
    (snapshot: ShareExitSnapshot) => {
      if (!shareToken) return;
      setExitSnapshotState((prev) => {
        const prevSnapshot = prev?.shareToken === shareToken ? prev.snapshot : null;
        if (
          prevSnapshot &&
          prevSnapshot.lastSlideId === snapshot.lastSlideId &&
          prevSnapshot.lastVideoId === snapshot.lastVideoId &&
          prevSnapshot.lastVideoTimeMs === snapshot.lastVideoTimeMs
        ) {
          return prev;
        }
        return { shareToken, snapshot };
      });
    },
    [shareToken],
  );

  // 공유 페이지 진입 시 익명 세션 초기화
  useEffect(() => {
    if (!data?.sessionInfo) return;

    const { user } = useAuthStore.getState();
    // 이미 세션이 있으면 스킵 (새로고침 등)
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

  useEffect(() => {
    if (!shareToken || !data) return;

    const sentKey = `pageview:${shareToken}`;
    if (sessionStorage.getItem(sentKey) === '1') return;

    sessionStorage.setItem(sentKey, '1');

    // 공유페이지 진입 시 `recordPageView`를 전송합니다.
    void recordPageView({ shareToken }).catch(() => {
      sessionStorage.removeItem(sentKey);
    });
  }, [shareToken, data]);

  const buildExitPayload = useCallback(() => {
    if (!shareToken || !data) return null;
    const exitSnapshot =
      exitSnapshotState?.shareToken === shareToken ? exitSnapshotState.snapshot : null;

    // 중앙 이탈 payload 생성:
    // `shareToken`은 항상 포함하고, `last*` 값은 하위 페이지가 보고한 경우에만 포함합니다.
    return {
      shareToken,
      ...(exitSnapshot?.lastSlideId != null ? { lastSlideId: exitSnapshot.lastSlideId } : {}),
      ...(exitSnapshot?.lastVideoId != null ? { lastVideoId: exitSnapshot.lastVideoId } : {}),
      ...(exitSnapshot?.lastVideoTimeMs != null
        ? { lastVideoTimeMs: exitSnapshot.lastVideoTimeMs }
        : {}),
    };
  }, [shareToken, data, exitSnapshotState]);

  // 공유 페이지의 `/analytics/exit`는 이 위치에서만 전송합니다.
  useExitTracker(buildExitPayload);

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

  const scope = data.shareInfo.scope;

  if (scope === 'slides_script') {
    return (
      <FeedbackSlidePage
        sharedContent={data}
        onShareExitSnapshotChange={handleShareExitSnapshotChange}
      />
    );
  }

  return (
    <FeedbackVideoPage
      sharedContent={data}
      onShareExitSnapshotChange={handleShareExitSnapshotChange}
    />
  );
}
