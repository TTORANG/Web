import { useEffect, useRef } from 'react';

import { identifyPosthogUser, resetPosthogUser } from '@/analytics/posthogClient';
import { useAuthStore } from '@/stores/authStore';
import { isAnonymousEmail } from '@/utils/auth';

export function usePosthogAuthSync() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const lastIdentifiedUserIdRef = useRef<string | null>(null);
  const hasSocialSessionRef = useRef(false);

  useEffect(() => {
    const isSocialUser = Boolean(accessToken && user && !isAnonymousEmail(user.email));

    if (isSocialUser && user) {
      if (lastIdentifiedUserIdRef.current !== user.id) {
        identifyPosthogUser(user);
        lastIdentifiedUserIdRef.current = user.id;
      }

      hasSocialSessionRef.current = true;
      return;
    }

    if (hasSocialSessionRef.current) {
      resetPosthogUser();
      hasSocialSessionRef.current = false;
      lastIdentifiedUserIdRef.current = null;
    }
  }, [accessToken, user]);
}
