import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Spinner } from '@/components/common';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const errorParam = searchParams.get('error');
    const accessToken = searchParams.get('accessToken');
    const sessionIdParam = searchParams.get('sessionId');

    if (import.meta.env.DEV) {
      console.info('[OAuthCallback] params:', {
        error: errorParam,
        hasAccessToken: !!accessToken,
        hasSessionId: !!sessionIdParam,
      });
    }

    if (errorParam) {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'oauth:error',
            error: errorParam,
          },
          window.location.origin,
        );
        // 부모 창이 메시지를 수신할 시간을 확보한 후 팝업 닫기
        setTimeout(() => window.close(), 300);
        return;
      }
      navigate('/', { replace: true });
      return;
    }

    // 필수 파라미터가 없으면 팝업 닫기 또는 홈으로
    if (!accessToken) {
      if (window.opener) setTimeout(() => window.close(), 300);
      else navigate('/', { replace: true });
      return;
    }

    // 팝업인 경우 부모에게 토큰 전달해서 팝업 닫음, 아니면 홈으로 이동
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'oauth:callback',
          accessToken,
          sessionId: sessionIdParam ?? undefined,
        },
        window.location.origin,
      );
      // 부모 창이 메시지를 수신할 시간을 확보한 후 팝업 닫기
      setTimeout(() => window.close(), 300);
      return;
    }
    navigate('/', { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size={48} />
    </div>
  );
}
