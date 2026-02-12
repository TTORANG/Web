import { describe, expect, it } from 'vitest';

import { parseJwtPayload } from './jwt';

// Helper to create a JWT with given payload
function createJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.fake-signature`;
}

describe('parseJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    const token = createJwt({ id: '123', email: 'test@example.com' });
    const result = parseJwtPayload<{ id: string; email: string }>(token);
    expect(result).toEqual({ id: '123', email: 'test@example.com' });
  });

  it('returns null for empty string', () => {
    expect(parseJwtPayload('')).toBeNull();
  });

  it('returns null for malformed token (no dots)', () => {
    expect(parseJwtPayload('not-a-jwt')).toBeNull();
  });

  it('returns null for token with empty payload', () => {
    expect(parseJwtPayload('header..signature')).toBeNull();
  });

  it('handles base64url special characters (- and _)', () => {
    // Payload containing characters that produce + and / in base64
    const payload = { data: '>>>???<<<' };
    const token = createJwt(payload);
    const result = parseJwtPayload<typeof payload>(token);
    expect(result).toEqual(payload);
  });

  it('handles Korean characters in payload', () => {
    // Manually encode Korean payload since btoa can't handle non-Latin1
    const payload = { name: '홍길동' };
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `header.${base64}.sig`;
    const result = parseJwtPayload<typeof payload>(token);
    expect(result).toEqual(payload);
  });
});
