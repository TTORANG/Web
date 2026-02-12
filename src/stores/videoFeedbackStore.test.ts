import { beforeEach, describe, expect, it } from 'vitest';

import {
  createMockComment,
  createMockReactions,
  createMockTimestampFeedback,
  createMockVideoFeedback,
} from '@/test/fixtures';

import { useVideoFeedbackStore } from './videoFeedbackStore';

const { getState } = useVideoFeedbackStore;

function resetStore() {
  useVideoFeedbackStore.setState({ video: null, currentTime: 0, seekTo: null });
}

describe('useVideoFeedbackStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('starts with null video', () => {
      expect(getState().video).toBeNull();
      expect(getState().currentTime).toBe(0);
      expect(getState().seekTo).toBeNull();
    });
  });

  describe('initVideo', () => {
    it('sets video and resets time/seek', () => {
      useVideoFeedbackStore.setState({ currentTime: 50, seekTo: 30 });
      const video = createMockVideoFeedback();
      getState().initVideo(video);
      expect(getState().video).toEqual(video);
      expect(getState().currentTime).toBe(0);
      expect(getState().seekTo).toBeNull();
    });
  });

  describe('updateCurrentTime', () => {
    it('updates current time', () => {
      getState().updateCurrentTime(42);
      expect(getState().currentTime).toBe(42);
    });
  });

  describe('requestSeek / clearSeek', () => {
    it('sets seekTo and currentTime', () => {
      getState().requestSeek(15);
      expect(getState().seekTo).toBe(15);
      expect(getState().currentTime).toBe(15);
    });

    it('clears seekTo', () => {
      getState().requestSeek(15);
      getState().clearSeek();
      expect(getState().seekTo).toBeNull();
    });
  });

  describe('addReaction', () => {
    it('reuses existing feedback within FEEDBACK_WINDOW', () => {
      const feedback = createMockTimestampFeedback({ timestampMs: 5000 });
      const video = createMockVideoFeedback({ feedbacks: [feedback] });
      getState().initVideo(video);
      getState().updateCurrentTime(5); // 5000ms - exactly at the feedback

      getState().addReaction('fire');

      const reactions = getState().video!.feedbacks[0].reactions;
      const fire = reactions.find((r) => r.type === 'fire');
      expect(fire?.count).toBe(1);
    });

    it('creates new feedback when none exist nearby', () => {
      const video = createMockVideoFeedback({ feedbacks: [] });
      getState().initVideo(video);
      getState().updateCurrentTime(10);

      getState().addReaction('good');

      expect(getState().video!.feedbacks).toHaveLength(1);
      expect(getState().video!.feedbacks[0].timestampMs).toBe(10000);
    });

    it('sorts feedbacks by timestamp after adding', () => {
      const f1 = createMockTimestampFeedback({ timestampMs: 20000 });
      const video = createMockVideoFeedback({ feedbacks: [f1] });
      getState().initVideo(video);
      getState().updateCurrentTime(5);

      getState().addReaction('fire');

      const timestamps = getState().video!.feedbacks.map((f) => f.timestampMs);
      expect(timestamps[0]).toBeLessThan(timestamps[1]);
    });

    it('is a no-op when video is null', () => {
      getState().addReaction('fire');
      expect(getState().video).toBeNull();
    });
  });

  describe('deleteComment', () => {
    it('deletes comment from the correct feedback', () => {
      const comment = createMockComment({ commentId: 'c1' });
      const feedback = createMockTimestampFeedback({
        timestampMs: 5000,
        comments: [comment],
      });
      const video = createMockVideoFeedback({ feedbacks: [feedback] });
      getState().initVideo(video);

      getState().deleteComment('c1');

      expect(getState().video!.feedbacks[0].comments).toHaveLength(0);
    });

    it('is a no-op when comment not found', () => {
      const feedback = createMockTimestampFeedback({ timestampMs: 5000 });
      const video = createMockVideoFeedback({ feedbacks: [feedback] });
      getState().initVideo(video);

      getState().deleteComment('nonexistent');

      expect(getState().video!.feedbacks[0]).toBeDefined();
    });

    it('is a no-op when video is null', () => {
      getState().deleteComment('c1');
      expect(getState().video).toBeNull();
    });
  });

  describe('updateComment', () => {
    it('updates comment content in the correct feedback', () => {
      const comment = createMockComment({ commentId: 'c1', content: 'old' });
      const feedback = createMockTimestampFeedback({
        timestampMs: 5000,
        comments: [comment],
      });
      const video = createMockVideoFeedback({ feedbacks: [feedback] });
      getState().initVideo(video);

      getState().updateComment('c1', 'new content');

      expect(getState().video!.feedbacks[0].comments[0].content).toBe('new content');
    });

    it('is a no-op when video is null', () => {
      getState().updateComment('c1', 'test');
      expect(getState().video).toBeNull();
    });
  });

  describe('updateFeedbacks', () => {
    it('replaces entire feedbacks array', () => {
      const video = createMockVideoFeedback({ feedbacks: [] });
      getState().initVideo(video);

      const newFeedbacks = [
        createMockTimestampFeedback({ timestampMs: 10000, reactions: createMockReactions() }),
      ];
      getState().updateFeedbacks(newFeedbacks);

      expect(getState().video!.feedbacks).toEqual(newFeedbacks);
    });

    it('is a no-op when video is null', () => {
      getState().updateFeedbacks([]);
      expect(getState().video).toBeNull();
    });
  });
});
