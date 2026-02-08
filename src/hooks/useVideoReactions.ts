/**
 * @file useVideoReactions.ts
 * @description 영상 리액션 관리 훅 (이벤트 window 방식)
 *
 * Optimistic UI 패턴으로 리액션 토글을 처리합니다.
 * 1. Store 즉시 업데이트 (optimistic)
 * 2. API 호출은 debounce 처리 (500ms, 연타 방지)
 * 3. 실패 시 rollback (toggleReaction 재호출)
 *
 * 타임스탬프 처리:
 * - 프론트엔드: 정확한 리액션 시간(timestampMs)을 서버에 전송
 * - 백엔드: timestampMs를 FLOOR 연산으로 segmentation (N ms 단위 그룹화)
 * - Debounce: 500ms 내 연타 시 마지막 클릭만 API 호출
 */
import { useMemo } from 'react';

import { REACTION_TYPES } from '@/constants/reaction';
import { FEEDBACK_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';
import { getOverlappingFeedbacks } from '@/utils/video';

import { useToggleVideoReaction } from './queries/useVideoReactionQueries';
import { useDebouncedCallback } from './useDebounce';

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
