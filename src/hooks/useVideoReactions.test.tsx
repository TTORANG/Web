import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OPTIMISTIC_LOCK_DURATION } from '@/constants/reaction';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import { createMockVideoFeedback } from '@/test/fixtures';
import type { ReactionType } from '@/types/script';

import { useVideoReactions } from './useVideoReactions';

type WindowReaction = {
  emojiType: ReactionType;
  count: number;
};

let mockWindowReactions: WindowReaction[] | undefined;
const mockMutate = vi.fn();

vi.mock('./queries/useVideoReactionQueries', () => ({
  useVideoReactionWindow: () => ({
    data: mockWindowReactions,
  }),
  useCreateVideoReaction: () => ({
    mutate: mockMutate,
  }),
}));

function getReactionCount(
  reactions: Array<{ type: ReactionType; count: number }>,
  type: ReactionType,
) {
  return reactions.find((reaction) => reaction.type === type)?.count ?? 0;
}

describe('useVideoReactions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockWindowReactions = [{ emojiType: 'fire', count: 10 }];

    useVideoFeedbackStore.setState({
      video: createMockVideoFeedback({ videoId: 'video-1', feedbacks: [] }),
      currentTime: 12,
      seekTo: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not show +2 when server count catches up during optimistic lock', () => {
    const { result, rerender } = renderHook(() => useVideoReactions());

    expect(getReactionCount(result.current.reactions, 'fire')).toBe(10);

    act(() => {
      result.current.addReaction('fire');
    });

    // optimistic +1
    expect(getReactionCount(result.current.reactions, 'fire')).toBe(11);

    // 서버 반영이 빨리 따라와도 +2로 뛰지 않아야 함
    mockWindowReactions = [{ emojiType: 'fire', count: 11 }];
    rerender();

    expect(getReactionCount(result.current.reactions, 'fire')).toBe(11);

    act(() => {
      vi.advanceTimersByTime(OPTIMISTIC_LOCK_DURATION + 10);
    });
    rerender();

    expect(getReactionCount(result.current.reactions, 'fire')).toBe(11);
  });
});
