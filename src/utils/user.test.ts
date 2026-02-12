import { describe, expect, it } from 'vitest';

import { getUserDisplayName } from './user';

describe('getUserDisplayName', () => {
  it('returns name when available', () => {
    expect(getUserDisplayName({ id: '1', email: 'test@a.com', name: 'Alice', sessionId: '' })).toBe(
      'Alice',
    );
  });

  it('falls back to email prefix when no name', () => {
    expect(getUserDisplayName({ id: '1', email: 'bob@test.com', sessionId: '' })).toBe('bob');
  });

  it('returns empty string when email is empty (split returns empty)', () => {
    // ?? treats '' as valid, so email.split('@')[0] === '' is returned
    expect(getUserDisplayName({ id: 'user-123', email: '', sessionId: '' })).toBe('');
  });

  it('returns default fallback for null user', () => {
    expect(getUserDisplayName(null)).toBe('사용자');
    expect(getUserDisplayName(undefined)).toBe('사용자');
  });

  it('uses custom fallback', () => {
    expect(getUserDisplayName(null, '익명')).toBe('익명');
  });
});
