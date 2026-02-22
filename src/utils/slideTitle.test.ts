import { describe, expect, it } from 'vitest';

import { getSlideTitle } from './slideTitle';

describe('getSlideTitle', () => {
  it('returns the original title when title exists', () => {
    expect(getSlideTitle('도입', 1)).toBe('도입');
  });

  it('returns fallback when title is null', () => {
    expect(getSlideTitle(null, 2)).toBe('슬라이드 2');
  });

  it('returns fallback when title is empty or blank', () => {
    expect(getSlideTitle('', 3)).toBe('슬라이드 3');
    expect(getSlideTitle('   ', 4)).toBe('슬라이드 4');
  });
});
