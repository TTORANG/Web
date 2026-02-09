/**
 * 이모지 리액션 훅
 *
 * Optimistic UI 패턴으로 리액션 토글을 처리합니다.
 *
 * @returns reactions - 현재 슬라이드의 리액션 목록
 * @returns toggleReaction - 리액션 토글 함수
 */
import { useQuery } from '@tanstack/react-query';

import { getTotalReactions } from '@/api/endpoints/reactions';
import { queryKeys } from '@/api/queryClient';
import { useSlideStore } from '@/stores/slideStore';
import type { Reaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';

import { useToggleReaction } from './queries/useReaction.ts';

const EMPTY_REACTIONS: Reaction[] = [];

export function useReactions() {
  const slideId = useSlideStore((state) => state.slide?.slideId);
  const reactions = useSlideStore((state) => state.slide?.emojiReactions ?? EMPTY_REACTIONS);
  const toggleReactionStore = useSlideStore((state) => state.toggleReaction);

  const { mutate: toggleReactionApi } = useToggleReaction();

  const toggleReaction = (type: ReactionType) => {
    if (!slideId) return;

    toggleReactionStore(type);

    toggleReactionApi(
      { slideId, data: { emojiType: type } },
      {
        onError: () => {
          showToast.error('반응을 반영하지 못했습니다.');
          toggleReactionStore(type);
        },
      },
    );
  };

  return { reactions, toggleReaction };
}

/**
 * 슬라이드 이모지 피드백 분포
 */
export function useSlideReactionsTotal(projectId: string) {
  return useQuery({
    queryKey: queryKeys.reactions.total(projectId),
    queryFn: () => getTotalReactions(projectId),
    enabled: !!projectId,
  });
}
