import { describe, expect, it } from 'vitest';

import { normalizeForSearch } from './normalizeForSearch';

describe('normalizeForSearch', () => {
  it('converts to lowercase', () => {
    expect(normalizeForSearch('HELLO')).toBe('hello');
  });

  it('removes special characters', () => {
    expect(normalizeForSearch('hello, world!')).toBe('helloworld');
  });

  it('removes whitespace', () => {
    expect(normalizeForSearch('hello world')).toBe('helloworld');
  });

  it('preserves Korean characters', () => {
    expect(normalizeForSearch('안녕하세요')).toBe('안녕하세요');
  });

  it('applies NFKC normalization', () => {
    // ﬁ (U+FB01) → fi after NFKC
    expect(normalizeForSearch('ﬁle')).toBe('file');
  });

  it('preserves numbers', () => {
    expect(normalizeForSearch('test123')).toBe('test123');
  });

  it('handles empty string', () => {
    expect(normalizeForSearch('')).toBe('');
  });
});
