import { describe, expect, it } from 'vitest';

import {
  extractTimestampFromComment,
  formatRelativeTime,
  formatVideoTimestamp,
  parseVideoTimestamp,
} from './format';

describe('formatVideoTimestamp', () => {
  it('converts seconds to m:ss format', () => {
    expect(formatVideoTimestamp(0)).toBe('0:00');
    expect(formatVideoTimestamp(5)).toBe('0:05');
    expect(formatVideoTimestamp(90)).toBe('1:30');
    expect(formatVideoTimestamp(115)).toBe('1:55');
  });

  it('converts to h:mm:ss when >= 1 hour', () => {
    expect(formatVideoTimestamp(3600)).toBe('1:00:00');
    expect(formatVideoTimestamp(3670)).toBe('1:01:10');
    expect(formatVideoTimestamp(7384)).toBe('2:03:04');
  });

  it('returns 0:00 for invalid inputs', () => {
    expect(formatVideoTimestamp(NaN)).toBe('0:00');
    expect(formatVideoTimestamp(Infinity)).toBe('0:00');
    expect(formatVideoTimestamp(-1)).toBe('0:00');
    expect(formatVideoTimestamp(-Infinity)).toBe('0:00');
  });

  it('floors fractional seconds', () => {
    expect(formatVideoTimestamp(90.9)).toBe('1:30');
  });
});

describe('parseVideoTimestamp', () => {
  it('parses m:ss format', () => {
    expect(parseVideoTimestamp('1:30')).toBe(90);
    expect(parseVideoTimestamp('0:00')).toBe(0);
    expect(parseVideoTimestamp('10:59')).toBe(659);
  });

  it('parses h:mm:ss format', () => {
    expect(parseVideoTimestamp('1:01:10')).toBe(3670);
    expect(parseVideoTimestamp('0:00:00')).toBe(0);
  });

  it('returns null for invalid formats', () => {
    expect(parseVideoTimestamp('')).toBeNull();
    expect(parseVideoTimestamp('abc')).toBeNull();
    expect(parseVideoTimestamp('1:60')).toBeNull();
    expect(parseVideoTimestamp('1:00:60')).toBeNull();
    expect(parseVideoTimestamp('1:2:3:4')).toBeNull();
  });

  it('trims whitespace', () => {
    expect(parseVideoTimestamp('  1:30  ')).toBe(90);
  });
});

describe('extractTimestampFromComment', () => {
  it('extracts timestamp and content', () => {
    const result = extractTimestampFromComment('1:30 안녕하세요');
    expect(result).toEqual({ seconds: 90, content: '안녕하세요' });
  });

  it('handles h:mm:ss format', () => {
    const result = extractTimestampFromComment('1:01:10 좋은 발표입니다');
    expect(result).toEqual({ seconds: 3670, content: '좋은 발표입니다' });
  });

  it('returns null when no timestamp prefix', () => {
    expect(extractTimestampFromComment('안녕하세요')).toBeNull();
    expect(extractTimestampFromComment('')).toBeNull();
  });

  it('returns null when timestamp has no following content', () => {
    expect(extractTimestampFromComment('1:30')).toBeNull();
  });
});

describe('formatRelativeTime', () => {
  it('returns relative time for valid dates', () => {
    const recent = new Date().toISOString();
    const result = formatRelativeTime(recent);
    expect(result).toContain('방금');
  });

  it('returns original string for invalid dates', () => {
    expect(formatRelativeTime('not-a-date')).toBe('not-a-date');
  });
});
