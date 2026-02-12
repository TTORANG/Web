import { beforeEach, describe, expect, it } from 'vitest';

import { useHomeStore } from './homeStore';

const { getState } = useHomeStore;

function resetStore() {
  useHomeStore.setState({ query: '', sort: null, filter: null, viewMode: 'card' });
}

describe('useHomeStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('has default values', () => {
      expect(getState().query).toBe('');
      expect(getState().viewMode).toBe('card');
      expect(getState().sort).toBeNull();
      expect(getState().filter).toBeNull();
    });
  });

  describe('setQuery', () => {
    it('updates search query', () => {
      getState().setQuery('test');
      expect(getState().query).toBe('test');
    });
  });

  describe('setViewMode', () => {
    it('switches between card and list', () => {
      getState().setViewMode('list');
      expect(getState().viewMode).toBe('list');
      getState().setViewMode('card');
      expect(getState().viewMode).toBe('card');
    });
  });

  describe('setSort', () => {
    it('updates sort mode', () => {
      getState().setSort('recent');
      expect(getState().sort).toBe('recent');
      getState().setSort('commentCount');
      expect(getState().sort).toBe('commentCount');
    });
  });

  describe('setFilter', () => {
    it('updates filter mode', () => {
      getState().setFilter('3m');
      expect(getState().filter).toBe('3m');
    });
  });

  describe('reset', () => {
    it('resets query, sort, filter but preserves viewMode', () => {
      getState().setQuery('search');
      getState().setSort('recent');
      getState().setFilter('5m');
      getState().setViewMode('list');

      getState().reset();

      expect(getState().query).toBe('');
      expect(getState().sort).toBeNull();
      expect(getState().filter).toBeNull();
      expect(getState().viewMode).toBe('list'); // preserved
    });
  });
});
