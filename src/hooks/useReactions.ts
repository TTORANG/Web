// hooks/useReactions.ts
import { useSlideStore } from '@/stores/slideStore';
import type { EmojiReaction } from '@/types/script';
import { showToast } from '@/utils/toast';

import { useToggleReaction } from './queries/useReactionQueries';

const EMPTY_REACTIONS: EmojiReaction[] = [];

export function useReactions() {
  const slideId = useSlideStore((state) => state.slide?.id);
  // SlideStore에서 "현재 슬라이드의 리액션"과 "토글 함수"를 가져옵니다.
  const reactions = useSlideStore((state) => state.slide?.emojiReactions ?? EMPTY_REACTIONS);
  const toggleReactionStore = useSlideStore((state) => state.toggleReaction);

  const { mutate: toggleReactionApi } = useToggleReaction();

  const toggleReaction = (emoji: string) => {
    if (!slideId) return;

    // 1. Optimistic Update (Store)
    toggleReactionStore(emoji);

    // 2. API Call
    toggleReactionApi(
      { slideId, data: { emoji } },
      {
        onError: () => {
          showToast.error('반응을 반영하지 못했습니다.');
          // Optimistic Update Rollback
          toggleReactionStore(emoji);
        },
      },
    );
  };

  return { reactions, toggleReaction };
}
