import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;

  login: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;

  // 로그인 모달 상태/액션 추가
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isLoginModalOpen: false,

        login: (user, accessToken) => {
          set(
            {
              user,
              accessToken,
            },
            false,
            'auth/login',
          );
        },

        logout: () => {
          set(
            {
              user: null,
              accessToken: null,
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
      { name: 'auth-storage' },
    ),
    { name: 'AuthStore' },
  ),
);
