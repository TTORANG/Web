import type { JwtPayloadDto } from '@/api';
import type { User } from '@/types';
import type { AuthStatus } from '@/types/auth';

import { parseJwtPayload } from './jwt';

/**
 * 토큰에서 User를 생성합니다.
 * - accessToken이 생기는 모든 순간 여기를 통해 user를 만듭니다.
 */
export function userFromAccessToken(accessToken: string, sessionIdOverride?: string): User {
  const payload = parseJwtPayload<JwtPayloadDto>(accessToken);

  const id = payload?.id ?? '';
  const email = payload?.email ?? '';
  const sessionId = sessionIdOverride ?? payload?.sessionId ?? '';

  return {
    id,
    email,
    name: email ? email.split('@')[0] : undefined,
    sessionId,
    profileImage: payload?.profileImageUrl ?? undefined,
  };
}

/**
 * 익명/소셜 판별 규칙 (user.email 기반)
 */
export function isAnonymousEmail(email?: string | null): boolean {
  if (!email) return true;

  const e = email.toLowerCase();
  const [, domain = ''] = e.split('@');

  if (e.includes('anonymous')) return true;
  if (e.startsWith('anon')) return true;
  if (domain === 'ttorang.com') return true;

  return false;
}

export function deriveAuthStatus(accessToken: string | null, user: User | null): AuthStatus {
  if (!accessToken) return 'guest';
  if (!user) return 'anonymous';
  return isAnonymousEmail(user.email) ? 'anonymous' : 'social';
}
