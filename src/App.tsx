import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryClient';
import { DevFab } from '@/components/common/DevFab';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useThemeListener } from '@/stores/themeStore';

import { sessionApi } from './api/endpoints/session';
import { isAnonymousEmail, userFromAccessToken } from './utils/auth';
import { showToast } from './utils/toast';

function App() {
  useThemeListener();
  const queryClient = useQueryClient();

  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as
        | { type: 'oauth:callback'; accessToken?: string; sessionId?: string }
        | undefined;
      if (!data || data.type !== 'oauth:callback') return;

      const accessToken = data.accessToken as string | undefined;
      if (!accessToken) return;

      const sessionIdFromCallback = data.sessionId ?? undefined;

      const store = useAuthStore.getState();

      // 로그인 전 익명 세션이 있었다면 병합 대상으로 기억
      const prevAnonymousSessionId = store.anonymousSessionId;

      const nextAccessToken = accessToken;
      const nextUser = userFromAccessToken(accessToken, sessionIdFromCallback);

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
          /** intentionally ignored */
        }
      }

      // 목록은 무조건 갱신
      await queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.lists(),
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

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
