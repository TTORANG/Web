/**
 * 테마 관리 스토어
 *
 * light/dark/auto 테마 설정을 관리하고 시스템 설정과 동기화합니다.
 * persist 미들웨어로 사용자 선호도를 저장합니다.
 */
import { useEffect } from 'react';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ThemeMode } from '@/types/theme';

export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => void;
}

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'auto',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        set({ theme });
        get().initTheme();
      },

      initTheme: () => {
        const { theme } = get();
        let nextResolved: ResolvedTheme;

        if (theme === 'auto') {
          nextResolved = getSystemTheme();
        } else {
          nextResolved = theme;
        }

        set({ resolvedTheme: nextResolved });
        document.documentElement.dataset.theme = nextResolved;
      },
    }),
    {
      name: 'ttorang-theme',
      onRehydrateStorage: () => (state) => {
        state?.initTheme();
      },
    },
  ),
);

/**
 * 시스템 테마 변경 및 탭 간 동기화 리스너 훅
 *
 * 앱 최상위 컴포넌트에서 한 번만 호출해야 합니다.
 */
export function useThemeListener() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const { theme } = useThemeStore.getState();
      if (theme === 'auto') {
        initTheme();
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [initTheme]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ttorang-theme') {
        useThemeStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
}
