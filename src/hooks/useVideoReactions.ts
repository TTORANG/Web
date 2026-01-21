/**
 * @file useVideoReactions.ts
 * @description 영상 타임스탬프별 리액션 관리 훅
 *
 * useReactions.ts와 동일한 인터페이스를 제공합니다.
 */
import { useMemo } from 'react';

import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { EmojiReaction, ReactionType } from '@/types/script';

const EMPTY_REACTIONS: EmojiReaction[] = [];

export function useVideoReactions() {
  //CHANGED: currentTime(0.5초) 말고 activeTimestamp(5초 버킷) 기준으로 노출
  const activeTimestamp = useVideoFeedbackStore((state) => state.activeTimestamp);
  const video = useVideoFeedbackStore((state) => state.video);
  const toggleReactionStore = useVideoFeedbackStore((state) => state.toggleReaction);

  // 현재 타임스탬프의 리액션만 추출
  const reactions = useMemo(() => {
    if (!video) return EMPTY_REACTIONS;

    const feedback = video.feedbacks.find((f) => f.timestamp === activeTimestamp);
    return feedback?.reactions ?? EMPTY_REACTIONS;
  }, [video, activeTimestamp]);

  const toggleReaction = (type: ReactionType) => {
    // 1. Optimistic Update
    toggleReactionStore(type);

    // 2. API Call (TODO)
    // toggleReactionApi(
    //   { videoId, timestamp: currentTimestamp, data: { type } },
    //   {
    //     onError: () => {
    //       showToast.error('반응을 반영하지 못했습니다.');
    //       toggleReactionStore(type);
    //     },
    //   },
    // );
  };

  return { reactions, toggleReaction };
}
