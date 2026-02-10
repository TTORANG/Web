import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

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

      const user = userFromAccessToken(accessToken, sessionIdFromCallback);

      // store 저장
      store.setAuth({
        user,
        accessToken,
        refreshToken: null,
      });

      // 로그인 모달 닫기
      store.closeLoginModal();

      // 소셜 로그인이라면 익명 세션 병합
      const isSocialNow = !isAnonymousEmail(user.email);

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
                '익명 세션이 병합되었어요.',
                `${mergedCount}개의 발표가 계정으로 이동했어요.`,
              );
            }
          } else {
            showToast.warning(
              '세션 병합에 실패했어요.',
              mergeResponse.error?.reason ?? '잠시 후 다시 시도해주세요.',
            );
          }
        } catch (err: unknown) {
          let reason = '세션 병합 중 오류가 발생했어요.';

          if (isAxiosError(err)) {
            reason = err.response?.data?.error?.reason || err.message || reason;
          } else if (err instanceof Error) {
            reason = err.message || reason;
          }
          showToast.warning('로그인은 완료됐지만 익명 데이터 병합은 실패했어요.', reason);
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

  return (
    <>
      <RouterProvider router={router} />
      <DevFab />
    </>
  );
}

export default App;
