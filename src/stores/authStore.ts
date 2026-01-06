import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      isLoginModalOpen: false,

      login: (user, accessToken) => {
        set({
          user,
          accessToken,
          isLoginModalOpen: false,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
        });
      },

      updateUser: (userUpdates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null,
        }));
      },

      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
    }),
    {
      name: 'auth-storage',

      // 모달 열림 상태는 로컬스토리지에 저장하지 않기
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
