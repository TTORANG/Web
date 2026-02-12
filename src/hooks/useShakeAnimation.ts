import { useCallback, useEffect, useRef, useState } from 'react';

import type { ReactionType } from '@/types/script';

const MAX_SHAKE_INTENSITY = 3;
const DECAY_INTERVAL_MS = 500;

export function useShakeAnimation() {
  const [shakeIntensities, setShakeIntensities] = useState<Partial<Record<ReactionType, number>>>(
    {},
  );
  const decayIntervals = useRef<Partial<Record<ReactionType, ReturnType<typeof setInterval>>>>({});
  const decayDebounce = useRef<Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>>({});
  const clickCounts = useRef<Partial<Record<ReactionType, number>>>({});

  useEffect(() => {
    const intervals = decayIntervals.current;
    const debounces = decayDebounce.current;
    return () => {
      Object.values(intervals).forEach((id) => {
        if (id) clearInterval(id);
      });
      Object.values(debounces).forEach((id) => {
        if (id) clearTimeout(id);
      });
    };
  }, []);

  const startDecay = useCallback((type: ReactionType) => {
    if (decayIntervals.current[type]) {
      clearInterval(decayIntervals.current[type]);
    }

    decayIntervals.current[type] = setInterval(() => {
      setShakeIntensities((prev) => {
        const current = prev[type] || 0;
        if (current <= 1) {
          clearInterval(decayIntervals.current[type]);
          decayIntervals.current[type] = undefined;
          clickCounts.current[type] = 0;
          return { ...prev, [type]: 0 };
        }
        return { ...prev, [type]: current - 1 };
      });
    }, DECAY_INTERVAL_MS);
  }, []);

  const triggerShake = useCallback(
    (type: ReactionType) => {
      clickCounts.current[type] = (clickCounts.current[type] || 0) + 1;
      const clicks = clickCounts.current[type]!;

      const intensity = clicks >= 2 ? Math.min(clicks - 1, MAX_SHAKE_INTENSITY) : 0;
      setShakeIntensities((prev) => ({ ...prev, [type]: intensity }));

      if (decayIntervals.current[type]) {
        clearInterval(decayIntervals.current[type]);
        decayIntervals.current[type] = undefined;
      }
      if (decayDebounce.current[type]) {
        clearTimeout(decayDebounce.current[type]);
      }
      decayDebounce.current[type] = setTimeout(() => {
        startDecay(type);
      }, 500);
    },
    [startDecay],
  );

  return { shakeIntensities, triggerShake };
}
