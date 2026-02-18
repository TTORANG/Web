import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryClient';
import { DevFab } from '@/components/common/DevFab';
import { usePosthogAuthSync } from '@/hooks/usePosthogAuthSync';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useThemeListener } from '@/stores/themeStore';

import { sessionApi } from './api/endpoints/session';
import { isAnonymousEmail, userFromAccessToken } from './utils/auth';
import { showToast } from './utils/toast';

function App() {
  useThemeListener();
  usePosthogAuthSync();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as
        | { type: 'oauth:callback'; accessToken?: string; sessionId?: string }
        | { type: 'oauth:error'; error?: string }
        | undefined;
      if (!data) return;

      if (data.type === 'oauth:error') {
        const store = useAuthStore.getState();
        store.closeLoginModal();
        showToast.error(data.error ?? '소셜 로그인에 실패했습니다.');
        return;
      }
      if (data.type !== 'oauth:callback') return;

      const accessToken = data.accessToken as string | undefined;
      if (!accessToken) {
        return;
      }

      const sessionIdFromCallback = data.sessionId ?? undefined;

      const store = useAuthStore.getState();

      // 로그인 전 익명 세션이 있었다면 병합 대상으로 기억
      const prevAnonymousSessionId = store.anonymousSessionId;

      let nextAccessToken = accessToken;
      let nextUser = userFromAccessToken(accessToken, sessionIdFromCallback);

      // 로그인 직후에는 토큰 payload보다 reissue 응답의 user 정보가 더 정확할 수 있어
      // 먼저 동기화 시도 후 store에 반영합니다.
      try {
        const reissueResponse = await sessionApi.reissueToken(accessToken);
        if (reissueResponse.resultType === 'SUCCESS') {
          const { user, tokens } = reissueResponse.success;

          nextAccessToken = tokens.accessToken || accessToken;
          nextUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            sessionId: user.sessionId || sessionIdFromCallback || '',
            profileImage: user.profileImageUrl ?? undefined,
          };
        }
      } catch {
        // reissue 실패 시에는 callback accessToken 파싱 결과를 그대로 사용
      }

      // store 저장
      store.setAuth({
        user: nextUser,
        accessToken: nextAccessToken,
        refreshToken: null,
      });

      // 로그인 모달 닫기
      store.closeLoginModal();

      // 소셜 로그인이라면 익명 세션 병합
      const isSocialNow = !isAnonymousEmail(nextUser.email);

      if (isSocialNow && prevAnonymousSessionId) {
        try {
          const mergeResponse = await sessionApi.mergeSession({
            anonymousSessionId: prevAnonymousSessionId,
          });

          if (mergeResponse.resultType === 'SUCCESS') {
            store.clearAnonymousSession();
            const mergedCount = mergeResponse.success?.mergedProjectsCount;
            if (typeof mergedCount === 'number' && mergedCount > 0) {
              showToast.success(
                '임시 작업을 계정에 가져왔습니다.',
                `${mergedCount}개의 발표를 계정으로 이동했습니다.`,
              );
            }
          } else {
            showToast.warning(
              '임시 작업을 계정으로 가져오지 못했습니다.',
              mergeResponse.error?.reason ?? '잠시 후 다시 시도해주세요.',
            );
          }
        } catch {
          showToast.error(
            '임시 작업을 계정으로 가져오지 못했습니다.',
            '잠시 후 다시 시도해주세요.',
          );
        }
      }

      // 목록 갱신 (로그인 성공과 무관한 후속 작업이므로 fire-and-forget)
      queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.lists(),
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  useEffect(() => {
    if (!accessToken || !user) return;
    if (isAnonymousEmail(user.email)) return;

    const emailId = user.email.split('@')[0] ?? '';
    const needsNameSync = !user.name || user.name === emailId;
    if (!needsNameSync) return;

    let cancelled = false;

    const syncUserProfile = async () => {
      try {
        const reissueResponse = await sessionApi.reissueToken(accessToken);
        if (cancelled || reissueResponse.resultType !== 'SUCCESS') return;

        const store = useAuthStore.getState();
        const { refreshToken, anonymousSessionId } = store;
        const { user: reissuedUser, tokens } = reissueResponse.success;

        store.setAuth({
          user: {
            id: reissuedUser.id,
            email: reissuedUser.email,
            name: reissuedUser.name,
            sessionId: reissuedUser.sessionId,
            profileImage: reissuedUser.profileImageUrl ?? undefined,
          },
          accessToken: tokens.accessToken || accessToken,
          refreshToken,
          anonymousSessionId,
        });
      } catch {
        // 동기화 실패 시 기존 정보 유지
      }
    };

    void syncUserProfile();

    return () => {
      cancelled = true;
    };
  }, [accessToken, user]);

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('img, a')) {
        e.preventDefault();
      }
    };

    document.addEventListener('dragstart', handleDragStart);
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <DevFab />
    </>
  );
}

export default App;
