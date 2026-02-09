import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { JwtPayloadDto } from '@/api/dto';
import { Spinner } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import { parseJwtPayload } from '@/utils/jwt';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, closeLoginModal } = useAuthStore();
  const isProcessing = useRef(false);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const sessionIdParam = searchParams.get('sessionId');

    // 필수 파라미터가 없으면 팝업 닫기 또는 홈으로
    if (!accessToken) {
      if (window.opener) {
        window.close();
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    if (isProcessing.current) return;
    isProcessing.current = true;

    // JWT 디코딩으로 유저 정보 추출
    const payload = parseJwtPayload<JwtPayloadDto>(accessToken);
    const userId = payload?.id ?? '';
    const userEmail = payload?.email ?? '';
    const sessionId = sessionIdParam ?? payload?.sessionId ?? '';

    login(
      {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0] || userEmail,
        sessionId,
      },
      accessToken,
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
