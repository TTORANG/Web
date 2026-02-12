import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from './authStore';

const { getState } = useAuthStore;

function resetStore() {
  getState().logout();
  getState().closeLoginModal();
}

describe('useAuthStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('starts as guest', () => {
      expect(getState().status).toBe('guest');
      expect(getState().user).toBeNull();
      expect(getState().accessToken).toBeNull();
      expect(getState().refreshToken).toBeNull();
      expect(getState().anonymousSessionId).toBeNull();
      expect(getState().isLoginModalOpen).toBe(false);
    });
  });

  describe('setAuth', () => {
    it('sets user and tokens, derives status', () => {
      getState().setAuth({
        user: { id: '1', email: 'user@google.com', sessionId: 's1' },
        accessToken: 'token',
      });
      expect(getState().status).toBe('social');
      expect(getState().user?.email).toBe('user@google.com');
      expect(getState().accessToken).toBe('token');
    });

    it('derives anonymous status for anonymous email', () => {
      getState().setAuth({
        user: { id: '1', email: 'anon@ttorang.com', sessionId: 's1' },
        accessToken: 'token',
        anonymousSessionId: 'anon-session',
      });
      expect(getState().status).toBe('anonymous');
      expect(getState().anonymousSessionId).toBe('anon-session');
    });
  });

  describe('login', () => {
    it('sets social user', () => {
      getState().login({ id: '1', email: 'user@google.com', sessionId: 's1' }, 'access-token');
      expect(getState().status).toBe('social');
      expect(getState().accessToken).toBe('access-token');
    });
  });

  describe('anonymous', () => {
    it('sets anonymous session', () => {
      getState().anonymous('sess-1', 'at', 'rt', {
        id: '1',
        email: 'anon@ttorang.com',
        sessionId: 'sess-1',
      });
      expect(getState().status).toBe('anonymous');
      expect(getState().anonymousSessionId).toBe('sess-1');
      expect(getState().refreshToken).toBe('rt');
    });
  });

  describe('logout', () => {
    it('resets all auth state', () => {
      getState().login({ id: '1', email: 'user@google.com', sessionId: 's1' }, 'token');
      getState().logout();
      expect(getState().status).toBe('guest');
      expect(getState().user).toBeNull();
      expect(getState().accessToken).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('merges partial user updates', () => {
      getState().login({ id: '1', email: 'a@b.com', sessionId: 's1' }, 'token');
      getState().updateUser({ name: 'Updated' });
      expect(getState().user?.name).toBe('Updated');
      expect(getState().user?.email).toBe('a@b.com');
    });

    it('is a no-op when user is null', () => {
      getState().updateUser({ name: 'test' });
      expect(getState().user).toBeNull();
    });
  });

  describe('login modal', () => {
    it('opens and closes', () => {
      getState().openLoginModal();
      expect(getState().isLoginModalOpen).toBe(true);
      getState().closeLoginModal();
      expect(getState().isLoginModalOpen).toBe(false);
    });
  });

  describe('getDerivedStatus', () => {
    it('derives status from current state', () => {
      expect(getState().getDerivedStatus()).toBe('guest');
      getState().login({ id: '1', email: 'user@google.com', sessionId: 's1' }, 'token');
      expect(getState().getDerivedStatus()).toBe('social');
    });
  });

  describe('clearAnonymousSession', () => {
    it('clears anonymousSessionId', () => {
      getState().anonymous('sess-1', 'at', 'rt', {
        id: '1',
        email: 'anon@ttorang.com',
        sessionId: 'sess-1',
      });
      expect(getState().anonymousSessionId).toBe('sess-1');
      getState().clearAnonymousSession();
      expect(getState().anonymousSessionId).toBeNull();
    });
  });
});
