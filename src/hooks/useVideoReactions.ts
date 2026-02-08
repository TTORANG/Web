/**
 * @file useVideoReactions.ts
 * @description 영상 리액션 관리 훅 (이벤트 window 방식)
 *
 * Optimistic UI 패턴으로 리액션 토글을 처리합니다.
 * 1. Store 즉시 업데이트 (optimistic)
 * 2. API 비동기 호출
 * 3. 실패 시 rollback (toggleReaction 재호출)
 *
 * 타임스탬프 잠금 메커니즘:
 * - 첫 토글 시점의 timestampMs를 2초간 잠금
 * - 2초 내 동일 emojiType 토글은 같은 timestampMs 사용 (서버 토글 정합성)
 * - 정지 중에는 currentTime 불변 → 자연스럽게 동일 timestampMs 유지
 */
import { useMemo, useRef } from 'react';

import { REACTION_TYPES } from '@/constants/reaction';
import { FEEDBACK_WINDOW, REACTION_TOGGLE_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';
import { getOverlappingFeedbacks } from '@/utils/video';

import { useToggleVideoReaction } from './queries/useVideoReactionQueries';

interface LockedTimestamp {
  timestampMs: number;
  expiresAt: number; // Date.now() 기준 만료 시각
}

export function useVideoReactions() {
  const video = useVideoFeedbackStore((s) => s.video);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const toggleReactionStore = useVideoFeedbackStore((s) => s.toggleReaction);

  const { mutate: toggleReactionApi } = useToggleVideoReaction();

  /** emojiType별 잠긴 timestampMs (2초간 동일 값 유지) */
  const lockedTimestamps = useRef<Map<ReactionType, LockedTimestamp>>(new Map());

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
      return Math.abs(current.timestampMs - currentTime) <
        Math.abs(closest.timestampMs - currentTime)
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

  /**
   * emojiType별 잠긴 timestampMs를 반환합니다.
   * - 2초 윈도우 내: 기존 잠긴 값 재사용 (서버가 같은 레코드를 찾도록)
   * - 윈도우 만료 후: 현재 재생 시점의 정밀한 timestampMs로 새로 잠금
   */
  const getStableTimestampMs = (type: ReactionType): number => {
    const now = Date.now();
    const locked = lockedTimestamps.current.get(type);

    // 2초 윈도우 내 → 같은 timestampMs 재사용
    if (locked && now < locked.expiresAt) {
      return locked.timestampMs;
    }

    // 새 timestampMs: 현재 재생 시간의 정밀한 밀리초 값 (예: 3.567s → 3567ms)
    const timestampMs = Math.round(currentTime * 1000);

    lockedTimestamps.current.set(type, {
      timestampMs,
      expiresAt: now + REACTION_TOGGLE_WINDOW,
    });

    return timestampMs;
  };

  const toggleReaction = (type: ReactionType) => {
    if (!video) {
      return;
    }

    const timestampMs = getStableTimestampMs(type);

    const requestData = {
      videoId: video.videoId,
      data: {
        emojiType: type,
        timestampMs,
      },
    };

    // 1. Store 즉시 업데이트 (optimistic)
    toggleReactionStore(type);

    // 2. API 비동기 호출
    toggleReactionApi(requestData, {
      onSuccess: () => {},
      onError: () => {
        showToast.error('반응을 반영하지 못했습니다.');
        toggleReactionStore(type);
      },
    });
  };

  return { reactions, toggleReaction };
}
