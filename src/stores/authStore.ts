/**
 * 인증 상태 관리 스토어
 *
 * 사용자 정보, 토큰, 로그인 모달 상태를 관리합니다.
 * persist 미들웨어로 브라우저 세션 유지를 지원합니다.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { AuthStatus, User } from '@/types/auth';
import { deriveAuthStatus } from '@/utils/auth';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  anonymousSessionId: string | null; // 익명 세션 병합용
  isLoginModalOpen: boolean;
  getDerivedStatus: () => AuthStatus;
  setAuth: (args: {
    user: User | null;
    accessToken: string | null;
    refreshToken?: string | null;
    anonymousSessionId?: string | null;
  }) => void;

  login: (user: User, accessToken: string) => void;
  anonymous: (sessionId: string, accessToken: string, refreshToken: string, user: User) => void;
  clearAnonymousSession: () => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}
type PersistedAuthState = Pick<
  AuthState,
  'status' | 'user' | 'accessToken' | 'refreshToken' | 'anonymousSessionId'
>;

const PERSIST_VERSION = 2;

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        status: 'guest',
        user: null,
        accessToken: null,
        refreshToken: null,
        anonymousSessionId: null,
        isLoginModalOpen: false,
        getDerivedStatus: () => deriveAuthStatus(get().accessToken, get().user),

        setAuth: ({ user, accessToken, refreshToken = null, anonymousSessionId = null }) => {
          const nextStatus = deriveAuthStatus(accessToken, user);
          set(
            {
              status: nextStatus, // 호환용
              user,
              accessToken,
              refreshToken,
              anonymousSessionId,
            },
            false,
            'auth/setAuth',
          );
        },

        // 소셜 로그인
        login: (user, accessToken) => {
          get().setAuth({
            user,
            accessToken,
            refreshToken: null,
          });
        },

        anonymous: (sessionId, accessToken, refreshToken, user) => {
          get().setAuth({
            user,
            accessToken,
            refreshToken,
            anonymousSessionId: sessionId,
          });
        },

        clearAnonymousSession: () => {
          set({ anonymousSessionId: null }, false, 'auth/clearAnonymousSession');
        },

        logout: () => {
          set(
            {
              status: 'guest',
              user: null,
              accessToken: null,
              refreshToken: null,
              anonymousSessionId: null,
            },
            false,
            'auth/logout',
          );
        },

        updateUser: (userUpdates) => {
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...userUpdates } : null,
            }),
            false,
            'auth/updateUser',
          );
        },

        openLoginModal: () => {
          set({ isLoginModalOpen: true }, false, 'auth/openLoginModal');
        },

        closeLoginModal: () => {
          set({ isLoginModalOpen: false }, false, 'auth/closeLoginModal');
        },
      }),
      {
        name: 'auth-storage',
        version: PERSIST_VERSION,
        onRehydrateStorage: () => {
          return (state, error) => {
            void state;
            if (error) {
              useAuthStore.setState({
                status: 'guest',
                user: null,
                accessToken: null,
                refreshToken: null,
                anonymousSessionId: null,
              });
            }
          };
        },
        migrate: (persistState, version): PersistedAuthState => {
          if (version < PERSIST_VERSION) {
            return {
              status: 'guest',
              user: null,
              accessToken: null,
              refreshToken: null,
              anonymousSessionId: null,
            };
          }
          return persistState as PersistedAuthState;
        },
        partialize: (s): PersistedAuthState => ({
          status: s.status,
          user: s.user,
          accessToken: s.accessToken,
          refreshToken: s.refreshToken,
          anonymousSessionId: s.anonymousSessionId,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);
