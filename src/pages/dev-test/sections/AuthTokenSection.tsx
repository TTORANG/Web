import { useState } from 'react';

import { sessionApi } from '@/api/endpoints/session';
import { TextField } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import { parseJwtPayload } from '@/utils/jwt';
import { showToast } from '@/utils/toast';

type JwtDecodeResult = { ok: true; payload: unknown } | { ok: false; reason: string };

const decodeJwtPayload = (token: string | null): JwtDecodeResult => {
  if (!token) {
    return { ok: false, reason: '토큰 없음' };
  }

  const payload = parseJwtPayload<unknown>(token);
  if (!payload) {
    return { ok: false, reason: 'payload 파싱 실패' };
  }

  return { ok: true, payload };
};

export function AuthTokenSection() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const anonymous = useAuthStore((state) => state.anonymous);
  const logout = useAuthStore((state) => state.logout);

  const [nextAccessToken, setNextAccessToken] = useState('');
  const [nextRefreshToken, setNextRefreshToken] = useState('');
  const [isCreatingAnonymousSession, setIsCreatingAnonymousSession] = useState(false);
  const [sessionResult, setSessionResult] = useState<string | null>(null);

  const accessPayload = decodeJwtPayload(accessToken);
  const refreshPayload = decodeJwtPayload(refreshToken);

  const handleSaveTokens = () => {
    const trimmedAccessToken = nextAccessToken.trim();
    const trimmedRefreshToken = nextRefreshToken.trim();

    if (!trimmedAccessToken) {
      showToast.warning('access token을 입력해주세요.');
      return;
    }

    anonymous(trimmedAccessToken, trimmedRefreshToken || refreshToken || '');
    showToast.success('토큰을 저장했습니다.');
  };

  const handleClearTokens = () => {
    logout();
    setNextAccessToken('');
    setNextRefreshToken('');
    showToast.success('토큰을 삭제했습니다.');
  };

  const handleCreateAnonymousSession = async () => {
    setIsCreatingAnonymousSession(true);

    try {
      const result = await sessionApi.createAnonymousSession();
      setSessionResult(JSON.stringify(result, null, 2));

      if (result.resultType === 'SUCCESS') {
        showToast.success('익명 세션 생성 성공');
      } else {
        showToast.error('익명 세션 생성 실패', result.error.reason);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '익명 세션 생성 요청 실패';
      setSessionResult(errorMessage);
      showToast.error('익명 세션 생성 요청 실패', errorMessage);
    } finally {
      setIsCreatingAnonymousSession(false);
    }
  };

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-black">🔐 Auth Token Test</h2>

      <div className="mb-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium text-black">설명</p>
        <ul className="list-inside list-disc space-y-1">
          <li>현재 access token / refresh token 상태를 확인합니다.</li>
          <li>access token만 입력해도 저장할 수 있습니다.</li>
          <li>refresh token 미입력 시 기존 값을 유지합니다.</li>
          <li>익명 세션 생성 API를 직접 호출해서 응답을 확인할 수 있습니다.</li>
        </ul>
      </div>

      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-100 p-4">
        <div>
          <p className="text-xs font-semibold text-gray-600">현재 Access Token</p>
          <p className="mt-1 break-all text-sm text-black">{accessToken ?? '없음'}</p>
          <div className="mt-2 rounded-md border border-gray-200 bg-white p-3">
            <p className="text-xs font-semibold text-gray-600">Access Payload</p>
            {accessPayload.ok ? (
              <pre className="mt-1 overflow-x-auto text-xs text-black">
                {JSON.stringify(accessPayload.payload, null, 2)}
              </pre>
            ) : (
              <p className="mt-1 text-xs text-gray-600">{accessPayload.reason}</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600">현재 Refresh Token</p>
          <p className="mt-1 break-all text-sm text-black">{refreshToken ?? '없음'}</p>
          <div className="mt-2 rounded-md border border-gray-200 bg-white p-3">
            <p className="text-xs font-semibold text-gray-600">Refresh Payload</p>
            {refreshPayload.ok ? (
              <pre className="mt-1 overflow-x-auto text-xs text-black">
                {JSON.stringify(refreshPayload.payload, null, 2)}
              </pre>
            ) : (
              <p className="mt-1 text-xs text-gray-600">{refreshPayload.reason}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <TextField
          value={nextAccessToken}
          onChange={(e) => setNextAccessToken(e.target.value)}
          placeholder="새 access token 입력"
        />
        <TextField
          value={nextRefreshToken}
          onChange={(e) => setNextRefreshToken(e.target.value)}
          placeholder="새 refresh token 입력 (선택)"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={handleSaveTokens}
          className="rounded-lg bg-main px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-main-variant2"
        >
          토큰 저장(localStorage 반영)
        </button>
        <button
          onClick={handleClearTokens}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-400"
        >
          토큰 삭제
        </button>
        <button
          onClick={handleCreateAnonymousSession}
          disabled={isCreatingAnonymousSession}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreatingAnonymousSession ? '익명 세션 생성 중...' : '익명 세션 생성 API 호출'}
        </button>
      </div>

      {sessionResult && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-600">익명 세션 응답</p>
          <pre className="mt-2 overflow-x-auto text-xs text-black">{sessionResult}</pre>
        </div>
      )}
    </section>
  );
}
