// hooks/useReactions.ts
import { useSlideStore } from '@/stores/slideStore';
import type { EmojiReaction } from '@/types/script';

const EMPTY_REACTIONS: EmojiReaction[] = [];

export function useReactions() {
  // SlideStore에서 "현재 슬라이드의 리액션"과 "토글 함수"를 가져옵니다.
  const reactions = useSlideStore((state) => state.slide?.emojiReactions ?? EMPTY_REACTIONS);
  const toggleReaction = useSlideStore((state) => state.toggleReaction);

  return { reactions, toggleReaction };
}
