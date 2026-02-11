/**
 * @file useVideoReactions.ts
 * @description Video reactions logic.
 *
 * - Count: sum of reactions within current playback time +/- 5000ms.
 * - 무제한 클릭: 클릭할 때마다 카운트 +1 (토글 아님)
 * - 클릭 시 confetti용 transient active 표시 (500ms 후 자동 해제)
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { REACTION_TYPES } from '@/constants/reaction';
import { REACTION_COUNT_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';

import { useCreateVideoReaction, useVideoReactionWindow } from './queries/useVideoReactionQueries';

const ACTIVE_FLASH_MS = 500;
const QUERY_TIMESTAMP_STEP_MS = 5000;
// useSldieReaction의 Lock개념 그대로 적용
const OPTIMISTIC_LOCK_DURATION = 2000;

export function useVideoReactions() {
  const video = useVideoFeedbackStore((s) => s.video);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const addReactionStore = useVideoFeedbackStore((s) => s.addReaction);

  const currentTimestampMs = Math.round(currentTime * 1000);
  const queryTimestampMs =
    Math.round(currentTimestampMs / QUERY_TIMESTAMP_STEP_MS) * QUERY_TIMESTAMP_STEP_MS;
  const queryWindowMs = REACTION_COUNT_WINDOW * 1000;

  const { data: windowReactions } = useVideoReactionWindow(
    video?.videoId,
    video ? queryTimestampMs : undefined,
    queryWindowMs,
  );
  const { mutate: createReactionApi } = useCreateVideoReaction();

  const [optimisticDeltas, setOptimisticDeltas] = useState<Partial<Record<ReactionType, number>>>(
    {},
  );
  const [transientActives, setTransientActives] = useState<Partial<Record<ReactionType, boolean>>>(
    {},
  );

  const [lockedTypes, setLockedTypes] = useState<Partial<Record<ReactionType, boolean>>>({});
  const activeTimers = useRef<Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>>({});
  const lockTimers = useRef<Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>>({});
  const pendingApiCount = useRef(0);

  useEffect(() => {
    const activeTimerMap = activeTimers.current;
    const lockTimerMap = lockTimers.current;
    return () => {
      Object.values(activeTimerMap).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      Object.values(lockTimerMap).forEach((timer) => {
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

    return REACTION_TYPES.map((type) => {
      const isLocked = lockedTypes[type] ?? false;

      // 락이 걸려있으면 optimistic delta 유지, 아니면 서버 값만 사용
      const count = isLocked
        ? Math.max(0, serverCountMap[type] + (optimisticDeltas[type] || 0))
        : serverCountMap[type];

      return {
        type,
        count,
        active: transientActives[type] ?? false,
      };
    });
  }, [video, windowReactions, optimisticDeltas, transientActives, lockedTypes]);

  const addReaction = (type: ReactionType) => {
    if (!video) return;

    const timestampMs = Math.round(currentTime * 1000);

    // optimistic lock 설정 (서버 데이터가 낙관적 업데이트를 덮어쓰지 않도록)
    setLockedTypes((prev) => ({ ...prev, [type]: true }));
    if (lockTimers.current[type]) {
      clearTimeout(lockTimers.current[type]);
    }
    lockTimers.current[type] = setTimeout(() => {
      setLockedTypes((prev) => ({ ...prev, [type]: false }));
    }, OPTIMISTIC_LOCK_DURATION);

    // 낙관적 업데이트: 카운트 +1
    addReactionStore(type);

    setOptimisticDeltas((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));

    // confetti용 transient active 표시
    setTransientActives((prev) => ({ ...prev, [type]: true }));
    if (activeTimers.current[type]) {
      clearTimeout(activeTimers.current[type]);
    }
    activeTimers.current[type] = setTimeout(() => {
      setTransientActives((prev) => ({ ...prev, [type]: false }));
    }, ACTIVE_FLASH_MS);

    // API 호출
    pendingApiCount.current += 1;

    createReactionApi(
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
          if (pendingApiCount.current <= 0) {
            setOptimisticDeltas({});
          }
        },
        onError: (error) => {
          // 글로벌 에러 핸들러의 토스트 방지 (isHandled 플래그 설정)
          if (error && typeof error === 'object' && 'isHandled' in error) {
            (error as Record<string, unknown>).isHandled = true;
          }
          // 정확한 숫자보다 즉각적인 반응 경험이 중요하므로 delta만 롤백
          setOptimisticDeltas((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) - 1,
          }));
        },
      },
    );
  };

  return { reactions, addReaction };
}
