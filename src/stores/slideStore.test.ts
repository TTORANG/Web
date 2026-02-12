import { beforeEach, describe, expect, it } from 'vitest';

import { createMockComment, createMockSlide } from '@/test/fixtures';

import { useSlideStore } from './slideStore';

const { getState } = useSlideStore;

function resetStore() {
  useSlideStore.setState({ slide: null });
}

describe('useSlideStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('starts with null slide', () => {
      expect(getState().slide).toBeNull();
    });
  });

  describe('initSlide', () => {
    it('sets the slide', () => {
      const slide = createMockSlide();
      getState().initSlide(slide);
      expect(getState().slide).toEqual(slide);
    });
  });

  describe('updateSlide', () => {
    it('merges partial updates', () => {
      getState().initSlide(createMockSlide({ title: 'Original' }));
      getState().updateSlide({ title: 'Updated' });
      expect(getState().slide?.title).toBe('Updated');
    });

    it('is a no-op when slide is null', () => {
      getState().updateSlide({ title: 'test' });
      expect(getState().slide).toBeNull();
    });
  });

  describe('updateScript', () => {
    it('updates the script', () => {
      getState().initSlide(createMockSlide({ script: 'old' }));
      getState().updateScript('new script');
      expect(getState().slide?.script).toBe('new script');
    });

    it('is a no-op when slide is null', () => {
      getState().updateScript('test');
      expect(getState().slide).toBeNull();
    });
  });

  describe('deleteComment', () => {
    it('removes comment from slide', () => {
      const c1 = createMockComment({ commentId: 'c1' });
      const c2 = createMockComment({ commentId: 'c2' });
      getState().initSlide(createMockSlide({ comments: [c1, c2] }));
      getState().deleteComment('c1');
      expect(getState().slide?.comments).toHaveLength(1);
      expect(getState().slide?.comments?.[0].commentId).toBe('c2');
    });

    it('cascading deletes children', () => {
      const parent = createMockComment({ commentId: 'p1' });
      const child = createMockComment({ commentId: 'c1', parentId: 'p1' });
      getState().initSlide(createMockSlide({ comments: [parent, child] }));
      getState().deleteComment('p1');
      expect(getState().slide?.comments).toHaveLength(0);
    });

    it('is a no-op when slide is null', () => {
      getState().deleteComment('c1');
      expect(getState().slide).toBeNull();
    });
  });

  describe('updateComment', () => {
    it('updates comment content', () => {
      const c1 = createMockComment({ commentId: 'c1', content: 'old' });
      getState().initSlide(createMockSlide({ comments: [c1] }));
      getState().updateComment('c1', 'new content');
      expect(getState().slide?.comments?.[0].content).toBe('new content');
    });
  });

  describe('addReaction', () => {
    it('increments reaction count', () => {
      getState().initSlide(
        createMockSlide({
          emojiReactions: [
            { type: 'fire', count: 0, active: false },
            { type: 'good', count: 5, active: false },
          ],
        }),
      );
      getState().addReaction('fire');
      expect(getState().slide?.emojiReactions?.[0].count).toBe(1);
      expect(getState().slide?.emojiReactions?.[1].count).toBe(5);
    });

    it('is a no-op when slide is null', () => {
      getState().addReaction('fire');
      expect(getState().slide).toBeNull();
    });
  });

  describe('setComments', () => {
    it('replaces the entire comments array', () => {
      getState().initSlide(createMockSlide({ comments: [] }));
      const newComments = [createMockComment()];
      getState().setComments(newComments);
      expect(getState().slide?.comments).toEqual(newComments);
    });

    it('is a no-op when slide is null', () => {
      getState().setComments([]);
      expect(getState().slide).toBeNull();
    });
  });
});
