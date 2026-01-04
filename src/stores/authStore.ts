import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;

  login: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,

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
      }),
      {
        name: 'auth-storage',
      },
    ),
    { name: 'AuthStore' },
  ),
);
