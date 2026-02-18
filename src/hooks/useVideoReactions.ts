/**
 * @file useVideoReactions.ts
 * @description Video reactions logic.
 *
 * - Count: sum of reactions within current playback time +/- 5000ms.
 * - 무제한 클릭: 클릭할 때마다 카운트 +1 (토글 아님)
 * - 클릭 시 confetti용 transient active 표시 (500ms 후 자동 해제)
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { OPTIMISTIC_LOCK_DURATION, REACTION_TYPES } from '@/constants/reaction';
import { REACTION_COUNT_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';

import { useCreateVideoReaction, useVideoReactionWindow } from './queries/useVideoReactionQueries';

const ACTIVE_FLASH_MS = 500;
const QUERY_TIMESTAMP_STEP_MS = 5000;

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
  const { mutate: createReactionApi } = useCreateVideoReaction();

  // 낙관적 반영은 "서버 카운트에 더하기"가 아니라
  // "최소 보장 카운트(floor)"로 관리해 중복 합산(+2) 현상을 방지한다.
  const [optimisticCounts, setOptimisticCounts] = useState<Partial<Record<ReactionType, number>>>(
    {},
  );
  const [transientActives, setTransientActives] = useState<Partial<Record<ReactionType, boolean>>>(
    {},
  );

  const [lockedTypes, setLockedTypes] = useState<Partial<Record<ReactionType, boolean>>>({});
  const activeTimers = useRef<Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>>({});
  const lockTimers = useRef<Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>>({});

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

      // 락이 걸려있으면 optimistic 최소값과 서버값 중 큰 값을 사용
      const count = isLocked
        ? Math.max(serverCountMap[type], optimisticCounts[type] || 0)
        : serverCountMap[type];

      return {
        type,
        count,
        active: transientActives[type] ?? false,
      };
    });
  }, [video, windowReactions, optimisticCounts, transientActives, lockedTypes]);

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
      // 락 해제 시 서버 값 우선으로 복귀
      setOptimisticCounts((prev) => ({ ...prev, [type]: 0 }));
    }, OPTIMISTIC_LOCK_DURATION);

    // 낙관적 업데이트: 현재 표시 카운트 기준 +1을 최소값으로 고정
    setOptimisticCounts((prev) => {
      const currentCount = reactions.find((reaction) => reaction.type === type)?.count ?? 0;
      const nextCount = currentCount + 1;
      return {
        ...prev,
        [type]: Math.max(prev[type] || 0, nextCount),
      };
    });

    // confetti용 transient active 표시
    setTransientActives((prev) => ({ ...prev, [type]: true }));
    if (activeTimers.current[type]) {
      clearTimeout(activeTimers.current[type]);
    }
    activeTimers.current[type] = setTimeout(() => {
      setTransientActives((prev) => ({ ...prev, [type]: false }));
    }, ACTIVE_FLASH_MS);

    // API 호출
    createReactionApi(
      {
        videoId: video.videoId,
        data: {
          emojiType: type,
          timestampMs,
        },
      },
      {
        onError: () => {
          // 실패 시 낙관적 최소값을 1만큼 롤백
          // 에러 토스트는 mutation의 meta.suppressErrorToast로 이미 억제됨
          setOptimisticCounts((prev) => ({
            ...prev,
            [type]: Math.max(0, (prev[type] || 0) - 1),
          }));
        },
      },
    );
  };

  return { reactions, addReaction };
}
