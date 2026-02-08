import { useMemo } from 'react';

import { REACTION_TYPES } from '@/constants/reaction';
import { FEEDBACK_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';
import { getOverlappingFeedbacks } from '@/utils/video';

import { useToggleVideoReaction } from './queries/useVideoReactionQueries';

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

  const reactions: Reaction[] = useMemo(() => {
    if (!video) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }

    // 현재 시간과 겹치는 모든 feedbacks 찾기 (±FEEDBACK_WINDOW 범위)
    const overlappingFeedbacks = getOverlappingFeedbacks(
      video.feedbacks,
      currentTime,
      FEEDBACK_WINDOW,
    );

    // 겹치는 feedbacks이 없으면 기본값
    if (overlappingFeedbacks.length === 0) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }

    // 가장 가까운 버킷 (active 상태 기준)
    const closestFeedback = overlappingFeedbacks.reduce((closest, current) => {
      return Math.abs(current.timestampMs - currentTime * 1000) <
        Math.abs(closest.timestampMs - currentTime * 1000)
        ? current
        : closest;
    });

    // 모든 겹치는 feedbacks의 reactions을 합산
    return REACTION_TYPES.map((type) => {
      // count: 모든 겹치는 feedbacks의 count 합산
      const totalCount = overlappingFeedbacks.reduce((sum, feedback) => {
        const reaction = feedback.reactions.find((r) => r.type === type);
        return sum + (reaction?.count || 0);
      }, 0);

      // active: 가장 가까운 버킷의 active 상태만 반영
      const closestReaction = closestFeedback.reactions.find((r) => r.type === type);

      return {
        type,
        count: totalCount,
        active: closestReaction?.active || false,
      };
    });
  }, [video, currentTime]);

  const toggleReaction = (type: ReactionType) => {
    if (!video) return;

    // 1. Store 즉시 업데이트 (optimistic)
    toggleReactionStore(type);

    // 2. API 비동기 호출
    toggleReactionApi(
      { videoId: video.videoId, data: { emojiType: type, timestampMs: Math.round(currentTime) } },
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
