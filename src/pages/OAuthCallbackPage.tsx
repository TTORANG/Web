import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Spinner } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import type { AuthProvider } from '@/types/auth';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, closeLoginModal } = useAuthStore();
  const isProcessing = useRef(false);

  useEffect(() => {
    // 백엔드에서 리다이렉트 시 전달받은 토큰들
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');
    const userEmail = searchParams.get('userEmail');
    const sessionId = searchParams.get('sessionId');
    const provider = searchParams.get('provider') as AuthProvider | null;

    // 필수 파라미터가 없으면 홈으로
    if (!accessToken || !refreshToken || !userId) {
      if (window.opener) {
        window.close();
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    if (isProcessing.current) return;
    isProcessing.current = true;

    // 로그인 처리
    login(
      {
        id: userId,
        email: userEmail || '',
        name: userName || '',
        sessionId: sessionId || '',
        provider: provider || 'google',
      },
      accessToken,
      refreshToken,
    );

    closeLoginModal();

    // 팝업인 경우 닫기, 아니면 홈으로 이동
    if (window.opener) {
      window.close();
    } else {
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, login, closeLoginModal]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size={48} />
    </div>
  );
}
