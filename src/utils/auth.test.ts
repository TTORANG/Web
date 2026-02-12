import { describe, expect, it } from 'vitest';

import { deriveAuthStatus, isAnonymousEmail, userFromAccessToken } from './auth';

// Helper to create a JWT with given payload
function createJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.fake-signature`;
}

describe('userFromAccessToken', () => {
  it('extracts user from valid token', () => {
    const token = createJwt({
      id: 'user-1',
      email: 'test@google.com',
      sessionId: 'sess-1',
      profileImageUrl: 'https://example.com/pic.jpg',
    });
    const user = userFromAccessToken(token);
    expect(user.id).toBe('user-1');
    expect(user.email).toBe('test@google.com');
    expect(user.name).toBe('test');
    expect(user.sessionId).toBe('sess-1');
    expect(user.profileImage).toBe('https://example.com/pic.jpg');
  });

  it('uses sessionIdOverride when provided', () => {
    const token = createJwt({ id: 'user-1', email: '', sessionId: 'original' });
    const user = userFromAccessToken(token, 'override-id');
    expect(user.sessionId).toBe('override-id');
  });

  it('falls back to empty strings for missing payload fields', () => {
    const token = createJwt({});
    const user = userFromAccessToken(token);
    expect(user.id).toBe('');
    expect(user.email).toBe('');
    expect(user.sessionId).toBe('');
  });

  it('sets name to undefined when email is empty', () => {
    const token = createJwt({ id: '1', email: '' });
    const user = userFromAccessToken(token);
    expect(user.name).toBeUndefined();
  });
});

describe('isAnonymousEmail', () => {
  it('returns true for null/undefined/empty', () => {
    expect(isAnonymousEmail(null)).toBe(true);
    expect(isAnonymousEmail(undefined)).toBe(true);
    expect(isAnonymousEmail('')).toBe(true);
  });

  it('returns true for anonymous patterns', () => {
    expect(isAnonymousEmail('anonymous@test.com')).toBe(true);
    expect(isAnonymousEmail('anon123@test.com')).toBe(true);
    expect(isAnonymousEmail('user@ttorang.com')).toBe(true);
  });

  it('returns false for social emails', () => {
    expect(isAnonymousEmail('user@google.com')).toBe(false);
    expect(isAnonymousEmail('user@kakao.com')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isAnonymousEmail('ANONYMOUS@test.com')).toBe(true);
    expect(isAnonymousEmail('ANON@test.com')).toBe(true);
  });
});

describe('deriveAuthStatus', () => {
  it('returns guest when no accessToken', () => {
    expect(deriveAuthStatus(null, null)).toBe('guest');
    expect(deriveAuthStatus(null, { id: '1', email: '', sessionId: '' })).toBe('guest');
  });

  it('returns anonymous when token exists but no user', () => {
    expect(deriveAuthStatus('token', null)).toBe('anonymous');
  });

  it('returns anonymous for anonymous email', () => {
    expect(deriveAuthStatus('token', { id: '1', email: 'anon@ttorang.com', sessionId: '' })).toBe(
      'anonymous',
    );
  });

  it('returns social for social email', () => {
    expect(deriveAuthStatus('token', { id: '1', email: 'user@google.com', sessionId: '' })).toBe(
      'social',
    );
  });
});
