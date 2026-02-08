/**
 * @file useVideoReactions.ts
 * @description 영상 리액션 관리 훅 (이벤트 window 방식)
 *
 * Optimistic UI 패턴으로 리액션 토글을 처리합니다.
 * 1. Store 즉시 업데이트 (optimistic)
 * 2. API 비동기 호출
 * 3. 실패 시 rollback (toggleReaction 재호출)
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

    // 현재 시간과 겹치는 모든 feedbacks 찾기 (±FEEDBACK_WINDOW 범위)
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

  /**
   * API 호출 함수 (debounce 적용됨)
   * - 500ms 내 같은 리액션 연타 시 마지막 클릭만 서버에 전송
   * - 정확한 timestampMs를 서버에 전송 (segmentation은 백엔드에서 처리)
   */
  const callToggleReactionApi = useDebouncedCallback(
    (type: ReactionType, timestampMs: number) => {
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
          onSuccess: () => {},
          onError: () => {
            showToast.error('반응을 반영하지 못했습니다.');
            // 롤백: Store 상태 되돌리기
            toggleReactionStore(type);
          },
        },
      );
    },
    500, // 500ms debounce
  );

  const toggleReaction = (type: ReactionType) => {
    if (!video) {
      return;
    }

    // 정확한 타임스탬프: 현재 재생 시간의 밀리초 값 (예: 3.567s → 3567ms)
    const timestampMs = Math.round(currentTime * 1000);

    // 1. Store 즉시 업데이트 (Optimistic UI - 사용자는 즉시 반응 봄)
    toggleReactionStore(type);

    // 2. API 호출은 debounce 처리 (500ms 내 연타하면 마지막만 전송)
    callToggleReactionApi(type, timestampMs);
  };

  return { reactions, toggleReaction };
}
