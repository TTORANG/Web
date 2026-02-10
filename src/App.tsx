import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import type { JwtPayloadDto } from '@/api/dto';
import { queryKeys } from '@/api/queryClient';
import { DevFab } from '@/components/common/DevFab';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useThemeListener } from '@/stores/themeStore';
import { parseJwtPayload } from '@/utils/jwt';

function App() {
  useThemeListener();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== 'oauth:callback') return;

      const accessToken = data.accessToken as string | undefined;
      if (!accessToken) return;

      const payload = parseJwtPayload<JwtPayloadDto>(accessToken);
      const userId = payload?.id ?? '';
      const userEmail = payload?.email ?? '';
      const sessionId = data.sessionId ?? payload?.sessionId ?? '';

      useAuthStore.getState().login(
        {
          id: userId,
          email: userEmail,
          name: userEmail.split('@')[0] || userEmail,
          sessionId,
        },
        accessToken,
      );
      useAuthStore.getState().closeLoginModal();
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    void queryClient.invalidateQueries({ queryKey: queryKeys.presentations.lists() });
  }, [accessToken, queryClient]);

  return (
    <>
      <RouterProvider router={router} />
      <DevFab />
    </>
  );
}

export default App;
