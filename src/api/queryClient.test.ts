import { describe, expect, it } from 'vitest';

import { CACHE_GC_TIME_MS, CACHE_STALE_TIME_MS, MAX_RETRIES, queryKeys } from './queryClient';

describe('queryKeys', () => {
  describe('slides', () => {
    it('has correct all key', () => {
      expect(queryKeys.slides.all).toEqual(['slides']);
    });

    it('builds list key with projectId', () => {
      expect(queryKeys.slides.list('p1')).toEqual(['slides', 'list', 'p1']);
    });

    it('builds detail key with slideId', () => {
      expect(queryKeys.slides.detail('s1')).toEqual(['slides', 'detail', 's1']);
    });

    it('list key is derived from all', () => {
      expect(queryKeys.slides.lists()).toEqual(['slides', 'list']);
      expect(queryKeys.slides.list('p1').slice(0, 1)).toEqual(queryKeys.slides.all);
    });
  });

  describe('scripts', () => {
    it('has correct keys', () => {
      expect(queryKeys.scripts.all).toEqual(['scripts']);
      expect(queryKeys.scripts.detail('s1')).toEqual(['scripts', 'detail', 's1']);
      expect(queryKeys.scripts.versions('s1')).toEqual(['scripts', 'versions', 's1']);
    });
  });

  describe('presentations', () => {
    it('builds list key with params', () => {
      const params = { page: 1, limit: 10, search: 'test' };
      const key = queryKeys.presentations.list(params);
      expect(key).toEqual(['presentations', 'list', params]);
    });

    it('builds list key without params', () => {
      expect(queryKeys.presentations.list()).toEqual(['presentations', 'list', {}]);
    });

    it('builds detail key', () => {
      expect(queryKeys.presentations.detail('p1')).toEqual(['presentations', 'detail', 'p1']);
    });
  });

  describe('comments', () => {
    it('builds list and replies keys', () => {
      expect(queryKeys.comments.list('s1')).toEqual(['comments', 'list', 's1']);
      expect(queryKeys.comments.replies('c1')).toEqual(['comments', 'replies', 'c1']);
    });
  });

  describe('reactions', () => {
    it('builds summary and total keys', () => {
      expect(queryKeys.reactions.summary('s1')).toEqual(['reactions', 'summary', 's1']);
      expect(queryKeys.reactions.total('p1')).toEqual(['reactions', 'total', 'p1']);
    });
  });

  describe('videos', () => {
    it('builds list prefix key with projectId', () => {
      expect(queryKeys.videos.listPrefix('p1')).toEqual(['videos', 'list', 'p1']);
    });

    it('builds list key with params', () => {
      expect(
        queryKeys.videos.list('p1', { search: 'abc', filter: 'ready', sort: 'recent' }),
      ).toEqual(['videos', 'list', 'p1', { search: 'abc', filter: 'ready', sort: 'recent' }]);
    });

    it('builds list key without params', () => {
      expect(queryKeys.videos.list('p1')).toEqual(['videos', 'list', 'p1', {}]);
    });
  });

  describe('shares', () => {
    it('builds content key with sessionId', () => {
      expect(queryKeys.shares.content('token1', 'sess1')).toEqual([
        'shares',
        'content',
        'token1',
        'sess1',
      ]);
    });

    it('defaults sessionId to anonymous', () => {
      expect(queryKeys.shares.content('token1')).toEqual([
        'shares',
        'content',
        'token1',
        'anonymous',
      ]);
    });
  });
});

describe('cache constants', () => {
  it('has correct stale time (5 minutes)', () => {
    expect(CACHE_STALE_TIME_MS).toBe(1000 * 60 * 5);
  });

  it('has correct GC time (30 minutes)', () => {
    expect(CACHE_GC_TIME_MS).toBe(1000 * 60 * 30);
  });

  it('has correct max retries', () => {
    expect(MAX_RETRIES).toBe(1);
  });
});
