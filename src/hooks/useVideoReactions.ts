/**
 * @file useVideoReactions.ts
 * @description Video reactions logic.
 */
import { useMemo } from 'react';

import { REACTION_TYPES } from '@/constants/reaction';
import { FEEDBACK_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';
import { getOverlappingFeedbacks } from '@/utils/video';

import { useToggleVideoReaction, useVideoReactionWindow } from './queries/useVideoReactionQueries';
import { useDebouncedCallback } from './useDebounce';

const TIMESTAMP_BUCKET_MS = 500;

export function useVideoReactions() {
  const video = useVideoFeedbackStore((s) => s.video);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const toggleReactionStore = useVideoFeedbackStore((s) => s.toggleReaction);

  const currentTimestampMs = useMemo(
    () => Math.round((currentTime * 1000) / TIMESTAMP_BUCKET_MS) * TIMESTAMP_BUCKET_MS,
    [currentTime],
  );

  const { data: reactionSummary } = useVideoReactionWindow(
    video?.videoId,
    currentTimestampMs,
    FEEDBACK_WINDOW * 1000,
  );

  const { mutate: toggleReactionApi } = useToggleVideoReaction();

  const reactions: Reaction[] = useMemo(() => {
    if (!video) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }

    const overlappingFeedbacks = getOverlappingFeedbacks(
      video.feedbacks,
      currentTime,
      FEEDBACK_WINDOW,
    );

    const closestFeedback =
      overlappingFeedbacks.length > 0
        ? overlappingFeedbacks.reduce((closest, current) =>
            Math.abs(current.timestampMs - currentTime * 1000) <
            Math.abs(closest.timestampMs - currentTime * 1000)
              ? current
              : closest,
          )
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

    if (reactionSummary && reactionSummary.length > 0) {
      reactionSummary.forEach((item) => {
        if (REACTION_TYPES.includes(item.emojiType)) {
          countMap[item.emojiType] = item.count;
        }
      });
    } else if (overlappingFeedbacks.length > 0) {
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
  }, [video, currentTime, reactionSummary]);

  const callToggleReactionApi = useDebouncedCallback((type: ReactionType, timestampMs: number) => {
    if (!video) return;

    toggleReactionApi(
      {
        videoId: video.videoId,
        data: {
          emojiType: type,
          timestampMs,
        },
      },
      {
        onError: () => {
          showToast.error('반응을 반영하지 못했습니다.');
          toggleReactionStore(type);
        },
      },
    );
  }, 500);

  const toggleReaction = (type: ReactionType) => {
    if (!video) return;

    const timestampMs = Math.round(currentTime * 1000);
    toggleReactionStore(type);
    callToggleReactionApi(type, timestampMs);
  };

  return { reactions, toggleReaction };
}
