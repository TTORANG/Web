/**
 * @file useVideoReactions.ts
 * @description 영상 리액션 관리 훅 (이벤트 window 방식)
 *
 * - 목데이터는 feedbacks(timestamp + count) 구조 유지
 * - 내부에서 "가짜 이벤트 배열"로 풀어서
 *   currentTime 기준 ±2.5초 window 집계
 */
import { useMemo } from 'react';

import { REACTION_TYPES } from '@/constants/reaction';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { EmojiReaction, ReactionType } from '@/types/script';

// 구간설정 +-
const WINDOW = 5;
export function useVideoReactions() {
  const video = useVideoFeedbackStore((s) => s.video);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const toggleReaction = useVideoFeedbackStore((s) => s.toggleReaction);
  const reactions: EmojiReaction[] = useMemo(() => {
    if (!video) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }

    // 현재 시간과 겹치는 모든 feedbacks 찾기 (±WINDOW 범위)
    const overlappingFeedbacks = video.feedbacks.filter(
      (f) => Math.abs(f.timestamp - currentTime) <= WINDOW,
    );

    // 겹치는 feedbacks이 없으면 기본값
    if (overlappingFeedbacks.length === 0) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }

    // 가장 가까운 버킷 (active 상태 기준)
    const closestFeedback = overlappingFeedbacks.reduce((closest, current) => {
      return Math.abs(current.timestamp - currentTime) < Math.abs(closest.timestamp - currentTime)
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
  const handleToggleReaction = (type: ReactionType) => {
    toggleReaction(type);
  };
  return { reactions, toggleReaction: handleToggleReaction };
}
