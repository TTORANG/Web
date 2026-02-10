/**
 * @file useVideoReactions.ts
 * @description Video reactions logic.
 *
 * - Count: sum of reactions within current playback time +/- 5000ms.
 * - Active UI: transient only. It turns on immediately and turns off after 500ms.
 * - Network: debounce per emoji. Only the last click within 500ms is sent.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { REACTION_TYPES, getExclusiveCounterpart } from '@/constants/reaction';
import { REACTION_COUNT_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';
import { getStoredReactions, setStoredReaction } from '@/utils/reactionStorage';
import { showToast } from '@/utils/toast';

import { useToggleVideoReaction, useVideoReactionWindow } from './queries/useVideoReactionQueries';

const REACTION_DEBOUNCE_MS = 500;
const QUERY_TIMESTAMP_STEP_MS = 1000; // 몇초 마다 데이터 가져올지

export function useVideoReactions() {
  const video = useVideoFeedbackStore((s) => s.video);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);

  const currentTimestampMs = Math.round(currentTime * 1000);
  const queryTimestampMs =
    Math.round(currentTimestampMs / QUERY_TIMESTAMP_STEP_MS) * QUERY_TIMESTAMP_STEP_MS;
  const queryWindowMs = REACTION_COUNT_WINDOW * 1000;

  const { data: windowReactions } = useVideoReactionWindow(
    video?.videoId,
    video ? queryTimestampMs : undefined,
    queryWindowMs,
  );
  const { mutate: toggleReactionApi } = useToggleVideoReaction();

  const [optimisticDeltas, setOptimisticDeltas] = useState<Partial<Record<ReactionType, number>>>(
    {},
  );
  const [transientActives, setTransientActives] = useState<Partial<Record<ReactionType, boolean>>>(
    {},
  );

  const pendingDebounceTypes = useRef(new Set<ReactionType>());
  const pendingApiCount = useRef(0);
  const debounceTimers = useRef<Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>>({});
  const debounceBaselineActives = useRef<Partial<Record<ReactionType, boolean>>>({});
  const activeTimers = useRef<Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>>({});

  useEffect(() => {
    const debounceTimerMap = debounceTimers.current;
    const activeTimerMap = activeTimers.current;

    return () => {
      Object.values(debounceTimerMap).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      Object.values(activeTimerMap).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const reactions: Reaction[] = useMemo(() => {
    if (!video) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }

    const serverCountMap = REACTION_TYPES.reduce(
      (acc, type) => {
        acc[type] = 0;
        return acc;
      },
      {} as Record<ReactionType, number>,
    );

    windowReactions?.forEach((item) => {
      serverCountMap[item.emojiType] = item.count;
    });

    return REACTION_TYPES.map((type) => ({
      type,
      count: Math.max(0, serverCountMap[type] + (optimisticDeltas[type] || 0)),
      active: transientActives[type] ?? false,
    }));
  }, [video, windowReactions, optimisticDeltas, transientActives]);

  const toggleReaction = (type: ReactionType) => {
    if (!video) return;

    const timestampMs = Math.round(currentTime * 1000);
    const storedActive = getStoredReactions(video.videoId);
    const wasActive = storedActive[type];
    const newActive = !wasActive;

    const counterpart = getExclusiveCounterpart(type);
    const counterpartWasActive = counterpart ? storedActive[counterpart] : false;

    setTransientActives((prev) => {
      const next = { ...prev, [type]: true };
      if (counterpart) {
        next[counterpart] = false;
      }
      return next;
    });

    if (activeTimers.current[type]) {
      clearTimeout(activeTimers.current[type]);
    }
    activeTimers.current[type] = setTimeout(() => {
      setTransientActives((prev) => ({ ...prev, [type]: false }));
    }, REACTION_DEBOUNCE_MS);

    setOptimisticDeltas((prev) => {
      const next = {
        ...prev,
        [type]: (prev[type] || 0) + (wasActive ? -1 : 1),
      };
      if (newActive && counterpart && counterpartWasActive) {
        next[counterpart] = (prev[counterpart] || 0) - 1;
      }
      return next;
    });

    setStoredReaction(video.videoId, type, newActive);

    if (debounceTimers.current[type]) {
      clearTimeout(debounceTimers.current[type]);
    }
    if (!pendingDebounceTypes.current.has(type)) {
      debounceBaselineActives.current[type] = wasActive;
    }
    pendingDebounceTypes.current.add(type);

    debounceTimers.current[type] = setTimeout(() => {
      pendingDebounceTypes.current.delete(type);

      const latestStored = getStoredReactions(video.videoId);
      const latestDesiredActive = latestStored[type];
      const baselineActive = debounceBaselineActives.current[type];
      delete debounceBaselineActives.current[type];

      // 클릭 버스트 후 최종 상태가 처음과 같으면 POST 스킵
      if (baselineActive !== undefined && latestDesiredActive === baselineActive) {
        const hasPending = pendingDebounceTypes.current.size > 0 || pendingApiCount.current > 0;
        if (!hasPending) {
          setOptimisticDeltas({});
        }
        return;
      }

      pendingApiCount.current += 1;

      toggleReactionApi(
        {
          videoId: video.videoId,
          data: {
            emojiType: type,
            timestampMs,
          },
        },
        {
          onSettled: () => {
            pendingApiCount.current -= 1;
            const hasPending = pendingDebounceTypes.current.size > 0 || pendingApiCount.current > 0;
            if (!hasPending) {
              setOptimisticDeltas({});
            }
          },
          onError: () => {
            showToast.error('반응을 반영하지 못했습니다.');

            setStoredReaction(video.videoId, type, wasActive);
            if (counterpart && counterpartWasActive) {
              setStoredReaction(video.videoId, counterpart, true);
            }

            setOptimisticDeltas((prev) => {
              const next = {
                ...prev,
                [type]: (prev[type] || 0) + (wasActive ? 1 : -1),
              };
              if (counterpart && counterpartWasActive) {
                next[counterpart] = (prev[counterpart] || 0) + 1;
              }
              return next;
            });
          },
        },
      );
    }, REACTION_DEBOUNCE_MS);
  };

  return { reactions, toggleReaction };
}
