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
      resolvedTheme: 'light', // 초기값, initTheme에서 보정됨

      setTheme: (theme) => {
        set({ theme });
        get().initTheme(); // 테마 변경 시 재계산 및 적용
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

        // 시스템 설정 변경 감지 리스너 (한 번만 등록되도록 관리 필요하지만, 간단히 구현)
        // Zustand persist가 hydarate 될 때 실행되거나, 앱 진입 시 실행됨.
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
 * 시스템 테마 변경 및 스토리지 동기화 리스너 훅
 * 앱의 최상위 컴포넌트에서 한 번만 호출해야 합니다.
 */
export function useThemeListener() {
  const initTheme = useThemeStore((state) => state.initTheme);

  // 시스템 테마 변경 감지
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

  // 탭 간 테마 동기화 (Storage 이벤트 감지)
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
