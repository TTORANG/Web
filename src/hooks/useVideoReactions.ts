/**
 * @file useVideoReactions.ts
 * @description 영상 타임스탬프별 리액션 관리 훅
 *
 * useReactions.ts와 동일한 인터페이스를 제공합니다.
 */
import { useMemo } from 'react';

import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { EmojiReaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';

const EMPTY_REACTIONS: EmojiReaction[] = [];

export function useVideoReactions() {
  const currentTimestamp = useVideoFeedbackStore((state) => state.currentTimestamp);
  const video = useVideoFeedbackStore((state) => state.video);
  const toggleReactionStore = useVideoFeedbackStore((state) => state.toggleReaction);

  // 현재 타임스탬프의 리액션만 추출
  const reactions = useMemo(() => {
    if (!video) return EMPTY_REACTIONS;

    const feedback = video.feedbacks.find((f) => f.timestamp === currentTimestamp);
    return feedback?.reactions ?? EMPTY_REACTIONS;
  }, [video, currentTimestamp]);

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
