// hooks/useReactions.ts
import { useState } from 'react';

import { INITIAL_REACTIONS } from '../constants/feedback';

export function useReactions() {
  const [reactions, setReactions] = useState(INITIAL_REACTIONS);

  const toggleReaction = (emoji: string) => {
    setReactions((prev) =>
      prev.map((r) => {
        if (r.emoji !== emoji) return r;
        if (r.active) {
          return {
            ...r,
            active: false,
            count: Math.max(0, r.count - 1),
          };
        }
        return {
          ...r,
          active: true,
          count: r.count + 1,
        };
      }),
    );
  };

  return { reactions, toggleReaction };
}
