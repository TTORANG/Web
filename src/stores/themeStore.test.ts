import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThemeStore } from './themeStore';

const { getState } = useThemeStore;

function resetStore() {
  useThemeStore.setState({ theme: 'auto', resolvedTheme: 'light' });
}

// matchMedia mock
function mockMatchMedia(matches: boolean) {
  const listeners: Array<() => void> = [];
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: (_: string, cb: () => void) => listeners.push(cb),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  return listeners;
}

describe('useThemeStore', () => {
  beforeEach(() => {
    resetStore();
    mockMatchMedia(false); // default: light system theme
  });

  afterEach(() => {
    document.documentElement.dataset.theme = '';
  });

  describe('setTheme', () => {
    it('sets theme to light', () => {
      getState().setTheme('light');
      expect(getState().theme).toBe('light');
      expect(getState().resolvedTheme).toBe('light');
    });

    it('sets theme to dark', () => {
      getState().setTheme('dark');
      expect(getState().theme).toBe('dark');
      expect(getState().resolvedTheme).toBe('dark');
    });

    it('sets theme to auto and resolves from system', () => {
      mockMatchMedia(true); // dark system theme
      getState().setTheme('auto');
      expect(getState().theme).toBe('auto');
      expect(getState().resolvedTheme).toBe('dark');
    });
  });

  describe('initTheme', () => {
    it('sets document data-theme attribute', () => {
      getState().setTheme('dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('resolves auto to system light', () => {
      mockMatchMedia(false);
      getState().setTheme('auto');
      expect(getState().resolvedTheme).toBe('light');
      expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('resolves auto to system dark', () => {
      mockMatchMedia(true);
      getState().setTheme('auto');
      expect(getState().resolvedTheme).toBe('dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
  });
});
