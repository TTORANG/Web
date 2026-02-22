import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SCRIPT_READING_SPEED,
  countScriptReadableCharacters,
  estimateScriptDurationSeconds,
  estimateScriptsDurationSeconds,
  formatScriptDuration,
  getScriptReadingSpeedOption,
  getScriptReadingSpeedPreset,
  normalizeScriptReadingSpeed,
} from './scriptDuration';

describe('countScriptReadableCharacters', () => {
  it('excludes spaces, tabs and line breaks', () => {
    expect(countScriptReadableCharacters('안녕 하세요\n또랑\t입니다')).toBe(10);
  });
});

describe('getScriptReadingSpeedOption', () => {
  it('returns default option for unknown values', () => {
    expect(getScriptReadingSpeedOption('unknown').id).toBe('normal');
    expect(getScriptReadingSpeedOption(null).id).toBe('normal');
  });
});

describe('normalizeScriptReadingSpeed', () => {
  it('normalizes to integer speed in 200~400 range', () => {
    expect(normalizeScriptReadingSpeed(180)).toBe(200);
    expect(normalizeScriptReadingSpeed(500)).toBe(400);
    expect(normalizeScriptReadingSpeed(299.6)).toBe(300);
  });

  it('returns default speed for invalid values', () => {
    expect(normalizeScriptReadingSpeed(undefined)).toBe(DEFAULT_SCRIPT_READING_SPEED);
    expect(normalizeScriptReadingSpeed('invalid')).toBe(DEFAULT_SCRIPT_READING_SPEED);
  });
});

describe('getScriptReadingSpeedPreset', () => {
  it('returns matching preset when current speed equals preset value', () => {
    expect(getScriptReadingSpeedPreset(240)?.id).toBe('slow');
    expect(getScriptReadingSpeedPreset(300)?.id).toBe('normal');
  });

  it('returns null for custom speed values', () => {
    expect(getScriptReadingSpeedPreset(287)).toBeNull();
  });
});

describe('estimateScriptDurationSeconds', () => {
  it('estimates seconds with characters per minute', () => {
    expect(estimateScriptDurationSeconds('12345', 300)).toBe(1);
    expect(estimateScriptDurationSeconds('123456', 300)).toBe(2);
  });

  it('returns 0 when script is empty or speed is invalid', () => {
    expect(estimateScriptDurationSeconds('', 300)).toBe(0);
    expect(estimateScriptDurationSeconds('123', 0)).toBe(0);
    expect(estimateScriptDurationSeconds('123', Number.NaN)).toBe(0);
  });
});

describe('estimateScriptsDurationSeconds', () => {
  it('estimates total seconds from multiple scripts', () => {
    expect(estimateScriptsDurationSeconds(['12345', '12345'], 300)).toBe(2);
  });
});

describe('formatScriptDuration', () => {
  it('formats short duration to seconds', () => {
    expect(formatScriptDuration(59)).toBe('59초');
  });

  it('formats long duration to minutes and seconds', () => {
    expect(formatScriptDuration(60)).toBe('1분 0초');
    expect(formatScriptDuration(135)).toBe('2분 15초');
  });

  it('returns 0초 for invalid values', () => {
    expect(formatScriptDuration(-1)).toBe('0초');
    expect(formatScriptDuration(Number.POSITIVE_INFINITY)).toBe('0초');
  });
});
