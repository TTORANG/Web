import { useState } from 'react';

import { TextField } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/utils/toast';

type JwtDecodeResult = { ok: true; payload: unknown } | { ok: false; reason: string };

const decodeJwtPayload = (token: string | null): JwtDecodeResult => {
  if (!token) {
    return { ok: false, reason: '토큰 없음' };
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return { ok: false, reason: 'JWT 형식이 아닙니다.' };
  }

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = window.atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return { ok: true, payload: JSON.parse(json) };
  } catch {
    return { ok: false, reason: 'payload 파싱 실패' };
  }
};

export function AuthTokenSection() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const anonymous = useAuthStore((state) => state.anonymous);
  const logout = useAuthStore((state) => state.logout);

  const [nextAccessToken, setNextAccessToken] = useState('');
  const [nextRefreshToken, setNextRefreshToken] = useState('');

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

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-black">🔐 Auth Token Test</h2>

      <div className="mb-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium text-black">설명</p>
        <ul className="list-inside list-disc space-y-1">
          <li>현재 access token / refresh token 상태를 확인합니다.</li>
          <li>access token만 입력해도 저장할 수 있습니다.</li>
          <li>refresh token 미입력 시 기존 값을 유지합니다.</li>
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
      </div>
    </section>
  );
}
