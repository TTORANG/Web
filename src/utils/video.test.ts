import { describe, expect, it } from 'vitest';

import type { ReactionEvent } from '@/types/video';

import {
  clamp,
  computeSegmentHighlights,
  computeSegmentHighlightsFromFeedbacks,
  computeUserActiveHighlights,
  getOverlappingFeedbacks,
  getSlideIndexFromTime,
} from './video';

describe('getSlideIndexFromTime', () => {
  const changeTimes = [0, 12, 24, 38];

  it('returns 0 for time before first change', () => {
    expect(getSlideIndexFromTime(0, changeTimes)).toBe(0);
  });

  it('returns correct index for mid-range time', () => {
    expect(getSlideIndexFromTime(15, changeTimes)).toBe(1);
    expect(getSlideIndexFromTime(24, changeTimes)).toBe(2);
  });

  it('returns last index for time after last change', () => {
    expect(getSlideIndexFromTime(50, changeTimes)).toBe(3);
  });

  it('clamps to maxIndex when provided', () => {
    expect(getSlideIndexFromTime(50, changeTimes, 2)).toBe(2);
  });

  it('returns 0 for empty changeTimes', () => {
    expect(getSlideIndexFromTime(10, [])).toBe(0);
  });
});

describe('clamp', () => {
  it('returns value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('getOverlappingFeedbacks', () => {
  const feedbacks = [{ timestampMs: 5000 }, { timestampMs: 10000 }, { timestampMs: 20000 }];

  it('filters feedbacks within default ±5s window', () => {
    const result = getOverlappingFeedbacks(feedbacks, 5);
    expect(result).toHaveLength(2); // 5000, 10000
  });

  it('returns empty for no overlapping', () => {
    const result = getOverlappingFeedbacks(feedbacks, 50);
    expect(result).toHaveLength(0);
  });

  it('uses custom window', () => {
    const result = getOverlappingFeedbacks(feedbacks, 5, 0);
    expect(result).toHaveLength(1); // exact match: 5000
  });
});

describe('computeSegmentHighlights', () => {
  it('returns empty for no events', () => {
    expect(computeSegmentHighlights([], 60)).toEqual([]);
  });

  it('returns empty for zero/negative duration', () => {
    const events: ReactionEvent[] = [{ type: 'fire', at: 2 }];
    expect(computeSegmentHighlights(events, 0)).toEqual([]);
    expect(computeSegmentHighlights(events, -1)).toEqual([]);
  });

  it('groups events into 5-second buckets', () => {
    const events: ReactionEvent[] = [
      { type: 'fire', at: 1 },
      { type: 'fire', at: 3 },
      { type: 'good', at: 7 },
    ];
    const result = computeSegmentHighlights(events, 60);
    expect(result).toHaveLength(2);
    expect(result[0].startTime).toBe(0);
    expect(result[0].topReactionType).toBe('fire');
    expect(result[0].count).toBe(2);
    expect(result[1].startTime).toBe(5);
  });

  it('picks top reaction by count, ties broken by REACTION_TYPES order', () => {
    const events: ReactionEvent[] = [
      { type: 'good', at: 1 },
      { type: 'fire', at: 2 },
    ];
    const result = computeSegmentHighlights(events, 60);
    // Both have count 1, fire comes first in REACTION_TYPES
    expect(result[0].topReactionType).toBe('fire');
  });

  it('limits to topN segments', () => {
    const events: ReactionEvent[] = Array.from({ length: 50 }, (_, i) => ({
      type: 'fire' as const,
      at: i * 5 + 1,
    }));
    const result = computeSegmentHighlights(events, 300, 3);
    expect(result).toHaveLength(3);
  });

  it('returns results sorted by startTime', () => {
    const events: ReactionEvent[] = [
      { type: 'fire', at: 25 },
      { type: 'fire', at: 26 },
      { type: 'fire', at: 1 },
    ];
    const result = computeSegmentHighlights(events, 60);
    expect(result[0].startTime).toBeLessThan(result[1].startTime);
  });
});

describe('computeSegmentHighlightsFromFeedbacks', () => {
  it('returns empty for no feedbacks', () => {
    expect(computeSegmentHighlightsFromFeedbacks([], 60)).toEqual([]);
  });

  it('aggregates reaction counts from feedback objects', () => {
    const feedbacks = [
      {
        timestampMs: 2000,
        reactions: [
          { type: 'fire' as const, count: 5 },
          { type: 'good' as const, count: 3 },
        ],
      },
    ];
    const result = computeSegmentHighlightsFromFeedbacks(feedbacks, 60);
    expect(result).toHaveLength(1);
    expect(result[0].topReactionType).toBe('fire');
    expect(result[0].totalCount).toBe(8);
  });
});

describe('computeUserActiveHighlights', () => {
  it('returns empty for no feedbacks', () => {
    expect(computeUserActiveHighlights([], 60)).toEqual([]);
  });

  it('only includes active reactions', () => {
    const feedbacks = [
      {
        timestampMs: 2000,
        reactions: [
          { type: 'fire' as const, active: true },
          { type: 'good' as const, active: false },
        ],
      },
    ];
    const result = computeUserActiveHighlights(feedbacks, 60);
    expect(result).toHaveLength(1);
    expect(result[0].topReactionType).toBe('fire');
    expect(result[0].totalCount).toBe(1);
  });

  it('picks REACTION_TYPES order for representative', () => {
    const feedbacks = [
      {
        timestampMs: 2000,
        reactions: [
          { type: 'good' as const, active: true },
          { type: 'fire' as const, active: true },
        ],
      },
    ];
    const result = computeUserActiveHighlights(feedbacks, 60);
    expect(result[0].topReactionType).toBe('fire');
  });

  it('sorts results by startTime', () => {
    const feedbacks = [
      { timestampMs: 20000, reactions: [{ type: 'fire' as const, active: true }] },
      { timestampMs: 2000, reactions: [{ type: 'good' as const, active: true }] },
    ];
    const result = computeUserActiveHighlights(feedbacks, 60);
    expect(result[0].startTime).toBeLessThan(result[1].startTime);
  });
});
