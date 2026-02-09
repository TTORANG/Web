/**
 * @file useVideoReactions.ts
 * @description Video reactions logic.
 *
 * 전체 리액션 타임라인을 1회 조회한 뒤,
 * currentTime ± REACTION_COUNT_WINDOW 구간의 마커를 클라이언트에서 합산하여 표시.
 * 재생 중 반복적인 네트워크 요청을 보내지 않으므로 깜빡임이 없다.
 */
import { useMemo, useState } from 'react';

import type { ReadVideoReactionTimelineResponseDto } from '@/api/dto/reactions.dto';
import { REACTION_TYPES } from '@/constants/reaction';
import { FEEDBACK_WINDOW, REACTION_COUNT_WINDOW } from '@/constants/video';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Reaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';
import { getOverlappingFeedbacks } from '@/utils/video';

import {
  useToggleVideoReaction,
  useVideoReactionTimeline,
} from './queries/useVideoReactionQueries';
import { useDebouncedCallback } from './useDebounce';

export function useVideoReactions() {
  const video = useVideoFeedbackStore((s) => s.video);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const toggleReactionStore = useVideoFeedbackStore((s) => s.toggleReaction);

  const { data: timeline } = useVideoReactionTimeline(video?.videoId);

  const { mutate: toggleReactionApi } = useToggleVideoReaction();

  // 서버 갱신 전까지 카운트를 즉시 반영하기 위한 optimistic delta
  // timeline 참조가 바뀌면(서버 refetch) 렌더 중 초기화 (React 공식 패턴)
  const [optimisticDeltas, setOptimisticDeltas] = useState<Partial<Record<ReactionType, number>>>(
    {},
  );
  const [prevTimeline, setPrevTimeline] = useState<
    ReadVideoReactionTimelineResponseDto | undefined
  >(undefined);

  if (prevTimeline !== timeline) {
    setPrevTimeline(timeline);
    setOptimisticDeltas({});
  }

  const reactions: Reaction[] = useMemo(() => {
    if (!video) {
      return REACTION_TYPES.map((type) => ({ type, count: 0, active: false }));
    }

    // active 상태: 로컬 feedbacks에서 현재 시간 근처의 피드백으로 판단
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

    // count: 타임라인 마커에서 currentTime ± REACTION_COUNT_WINDOW 구간 합산
    const currentTimeMs = currentTime * 1000;
    const windowMs = REACTION_COUNT_WINDOW * 1000;

    const countMap: Record<ReactionType, number> = REACTION_TYPES.reduce(
      (acc, type) => {
        acc[type] = 0;
        return acc;
      },
      {} as Record<ReactionType, number>,
    );

    if (timeline?.markers && timeline.markers.length > 0) {
      timeline.markers.forEach((marker) => {
        if (
          Math.abs(marker.timestampMs - currentTimeMs) <= windowMs &&
          REACTION_TYPES.includes(marker.emojiType)
        ) {
          countMap[marker.emojiType] += marker.count;
        }
      });
    } else if (overlappingFeedbacks.length > 0) {
      // 타임라인 데이터가 없으면 로컬 feedbacks 폴백
      REACTION_TYPES.forEach((type) => {
        countMap[type] = overlappingFeedbacks.reduce((sum, feedback) => {
          const reaction = feedback.reactions.find((r) => r.type === type);
          return sum + (reaction?.count || 0);
        }, 0);
      });
    }

    return REACTION_TYPES.map((type) => ({
      type,
      count: Math.max(0, countMap[type] + (optimisticDeltas[type] || 0)),
      active: activeMap[type],
    }));
  }, [video, currentTime, timeline, optimisticDeltas]);

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

    // 토글 전 현재 active 상태 확인
    const overlapping = getOverlappingFeedbacks(video.feedbacks, currentTime, FEEDBACK_WINDOW);
    const closest =
      overlapping.length > 0
        ? overlapping.reduce((c, cur) =>
            Math.abs(cur.timestampMs - currentTime * 1000) <
            Math.abs(c.timestampMs - currentTime * 1000)
              ? cur
              : c,
          )
        : null;
    const wasActive = closest?.reactions.find((r) => r.type === type)?.active ?? false;

    // optimistic delta 적용
    setOptimisticDeltas((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + (wasActive ? -1 : 1),
    }));

    const timestampMs = Math.round(currentTime * 1000);
    toggleReactionStore(type);
    callToggleReactionApi(type, timestampMs);
  };

  return { reactions, toggleReaction };
}
