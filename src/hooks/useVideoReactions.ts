/**
 * @file useVideoReactions.ts
 * @description 영상 리액션 관리 훅 (이벤트 window 방식)
 *
 * - 목데이터는 feedbacks(timestamp + count) 구조 유지
 * - 내부에서 "가짜 이벤트 배열"로 풀어서
 *   currentTime 기준 ±2.5초 window 집계
 */
import { useMemo } from 'react';

import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { EmojiReaction, ReactionType } from '@/types/script';
import { REACTION_TYPES } from '@/types/script';

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
    // currentTime 기준 ±구간 버킷 찾기(계산 로직)
    const targetFeedback = video.feedbacks.find(
      (f) => Math.abs(f.timestamp - currentTime) <= WINDOW,
    );
    // 해당 버킷이 없으면 기본값
    if (!targetFeedback) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }
    // 해당 버킷의 reactions 반환 (active 포함)
    return targetFeedback.reactions;
  }, [video, currentTime]);
  const handleToggleReaction = (type: ReactionType) => {
    toggleReaction(type);
  };
  return { reactions, toggleReaction: handleToggleReaction };
}
