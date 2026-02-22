import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DEFAULT_SCRIPT_READING_SPEED,
  SCRIPT_READING_SPEED_STORAGE_KEY,
  normalizeScriptReadingSpeed,
} from '@/utils/scriptDuration';

interface ScriptReadingSpeedState {
  speed: number;
  setSpeed: (nextSpeed: number) => void;
}

export const useScriptReadingSpeedStore = create<ScriptReadingSpeedState>()(
  persist(
    (set) => ({
      speed: DEFAULT_SCRIPT_READING_SPEED,
      setSpeed: (nextSpeed) => {
        set({ speed: normalizeScriptReadingSpeed(nextSpeed) });
      },
    }),
    {
      name: SCRIPT_READING_SPEED_STORAGE_KEY,
      partialize: (state) => ({ speed: state.speed }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const normalizedSpeed = normalizeScriptReadingSpeed(state.speed);
        if (state.speed !== normalizedSpeed) {
          state.setSpeed(normalizedSpeed);
        }
      },
    },
  ),
);
