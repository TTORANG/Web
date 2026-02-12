import { describe, expect, it } from 'vitest';

import { REACTION_TYPES, createDefaultReactions, formatReactionCount } from './reaction';

describe('formatReactionCount', () => {
  it('returns the count when <= 99', () => {
    expect(formatReactionCount(0)).toBe(0);
    expect(formatReactionCount(50)).toBe(50);
    expect(formatReactionCount(99)).toBe(99);
  });

  it('returns "99+" when > 99', () => {
    expect(formatReactionCount(100)).toBe('99+');
    expect(formatReactionCount(999)).toBe('99+');
  });
});

describe('createDefaultReactions', () => {
  it('creates 5 reactions matching REACTION_TYPES', () => {
    const reactions = createDefaultReactions();
    expect(reactions).toHaveLength(REACTION_TYPES.length);
    reactions.forEach((r, i) => {
      expect(r.type).toBe(REACTION_TYPES[i]);
      expect(r.count).toBe(0);
      expect(r.active).toBe(false);
    });
  });

  it('returns independent instances (no shared references)', () => {
    const a = createDefaultReactions();
    const b = createDefaultReactions();
    expect(a).not.toBe(b);
    a[0].count = 10;
    expect(b[0].count).toBe(0);
  });
});

describe('REACTION_TYPES', () => {
  it('has 5 types in expected order', () => {
    expect(REACTION_TYPES).toEqual(['fire', 'sleepy', 'good', 'bad', 'confused']);
  });
});
