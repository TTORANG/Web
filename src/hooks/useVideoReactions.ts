import { useMemo } from 'react';

import { REACTION_TYPES } from '@/constants/reaction';
import { FEEDBACK_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';
import { getOverlappingFeedbacks } from '@/utils/video';

import { useToggleVideoReaction, useVideoReactionWindow } from './queries/useVideoReactionQueries';

/**
 * 영상 리액션 관리 훅
 *
 * Optimistic UI 패턴으로 리액션 토글을 처리합니다.
 * Store 즉시 업데이트 → API 호출 → 실패 시 rollback.
 *
 * @returns reactions - 현재 시간 구간의 리액션 목록
 * @returns toggleReaction - 리액션 토글 함수
 */
export function useVideoReactions() {
  const video = useVideoFeedbackStore((s) => s.video);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const toggleReactionStore = useVideoFeedbackStore((s) => s.toggleReaction);

  const { mutate: toggleReactionApi } = useToggleVideoReaction();
  const timestampMs = Math.round(currentTime * 1000);
  const requestTimestampMs = Math.round(timestampMs / 1000) * 1000;
  const windowMs = 2000;
  const { data: windowSummary } = useVideoReactionWindow(
    video?.videoId,
    requestTimestampMs,
    windowMs,
  );

  const reactions: Reaction[] = useMemo(() => {
    if (!video) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }

    // active는 로컬 스토어 기준 (exclusive 규칙 유지)
    const overlappingFeedbacks = getOverlappingFeedbacks(
      video.feedbacks,
      currentTime,
      FEEDBACK_WINDOW,
    );
    const closestFeedback =
      overlappingFeedbacks.length > 0
        ? overlappingFeedbacks.reduce((closest, current) => {
            return Math.abs(current.timestampMs - currentTime * 1000) <
              Math.abs(closest.timestampMs - currentTime * 1000)
              ? current
              : closest;
          })
        : null;

    const activeMap: Record<ReactionType, boolean> = REACTION_TYPES.reduce(
      (acc, type) => {
        acc[type] = closestFeedback?.reactions.find((r) => r.type === type)?.active ?? false;
        return acc;
      },
      {} as Record<ReactionType, boolean>,
    );

    const countMap: Record<ReactionType, number> = REACTION_TYPES.reduce(
      (acc, type) => {
        acc[type] = 0;
        return acc;
      },
      {} as Record<ReactionType, number>,
    );

    if (windowSummary) {
      windowSummary.forEach((item) => {
        countMap[item.emojiType] = item.count;
      });
    } else if (overlappingFeedbacks.length > 0) {
      // fallback: 로컬 store 기반 합산
      REACTION_TYPES.forEach((type) => {
        countMap[type] = overlappingFeedbacks.reduce((sum, feedback) => {
          const reaction = feedback.reactions.find((r) => r.type === type);
          return sum + (reaction?.count || 0);
        }, 0);
      });
    }

    return REACTION_TYPES.map((type) => ({
      type,
      count: countMap[type],
      active: activeMap[type],
    }));
  }, [video, currentTime, windowSummary]);

  const toggleReaction = (type: ReactionType) => {
    if (!video) return;

    // 1. Store 즉시 업데이트 (optimistic)
    toggleReactionStore(type);

    // 2. API 비동기 호출
    toggleReactionApi(
      {
        videoId: video.videoId,
        data: { emojiType: type, timestampMs },
      },
      {
        onError: () => {
          // 3. 실패 시 rollback
          showToast.error('반응을 반영하지 못했습니다.');
          toggleReactionStore(type);
        },
      },
    );
  };

  return { reactions, toggleReaction };
}
