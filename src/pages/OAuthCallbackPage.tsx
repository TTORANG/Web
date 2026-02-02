import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getGoogleCallback, getKakaoCallback, getNaverCallback } from '@/api';
import { Spinner } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import type { AuthProvider } from '@/types/auth';

const callbackMap = {
  google: getGoogleCallback,
  kakao: getKakaoCallback,
  naver: getNaverCallback,
} as const;

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, closeLoginModal } = useAuthStore();
  const isProcessing = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = searchParams.get('provider') as AuthProvider | null;

    if (!code || !provider || !callbackMap[provider]) {
      navigate('/', { replace: true });
      return;
    }

    if (isProcessing.current) return;
    isProcessing.current = true;

    const handleCallback = async () => {
      try {
        const callbackFn = callbackMap[provider];
        const result = await callbackFn(code);

        login(
          {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            sessionId: result.user.sessionId,
            provider,
          },
          result.tokens.accessToken,
          result.tokens.refreshToken,
        );

        closeLoginModal();
        navigate('/', { replace: true });
      } catch {
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, login, closeLoginModal]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
