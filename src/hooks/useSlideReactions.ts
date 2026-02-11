import { useEffect, useRef } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getTotalReactions } from '@/api/endpoints/reactions';
import { queryKeys } from '@/api/queryClient';
import { createDefaultReactions } from '@/constants/reaction';
import { useSlideStore } from '@/stores/slideStore';
import type { Reaction, ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';

import { useCreateReaction, useSlideReactionSummary } from './queries/useReaction.ts';

const EMPTY_REACTIONS: Reaction[] = [];
const OPTIMISTIC_LOCK_DURATION = 2000;

// 훅 밖에 전역 변수로 선언하여, 슬라이드를 이동해도 기록이 유지되게 함
// Key: "slideId-reactionType"
const globalLastActionTimes: Record<string, number> = {};

export function useSlideReactions() {
  const slideId = useSlideStore((state) => state.slide?.slideId);
  const reactions = useSlideStore((state) => state.slide?.emojiReactions ?? EMPTY_REACTIONS);
  const addReactionStore = useSlideStore((state) => state.addReaction);
  const updateSlide = useSlideStore((state) => state.updateSlide);
  const setReactionCounts = useSlideStore((state) => state.setReactionCounts);
  const queryClient = useQueryClient();

  const { mutate: createReactionApi } = useCreateReaction();
  const { data: reactionSummary } = useSlideReactionSummary(slideId);

  const latestReactionsRef = useRef(reactions);
  useEffect(() => {
    latestReactionsRef.current = reactions;
  }, [reactions]);

  useEffect(() => {
    if (!slideId || !reactionSummary) return;

    const currentReactionsState = latestReactionsRef.current;
    const now = Date.now();

    const nextReactions = createDefaultReactions().map((reaction) => {
      const current = currentReactionsState.find((r) => r.type === reaction.type);

      const lockKey = `${slideId}-${reaction.type}`;
      const lastActionTime = globalLastActionTimes[lockKey] || 0;
      const isLocked = now - lastActionTime < OPTIMISTIC_LOCK_DURATION;

      // 락이 걸려있으면(내가 방금 누름) -> 스토어 값(current.count) 유지
      // 락이 풀렸으면 -> 서버 값(reactionSummary) 반영
      const count = isLocked ? (current?.count ?? 0) : (reactionSummary[reaction.type] ?? 0);

      return {
        ...reaction,
        count,
      };
    });

    const isSame =
      currentReactionsState.length === nextReactions.length &&
      currentReactionsState.every((reaction) => {
        const next = nextReactions.find((item) => item.type === reaction.type);
        return next?.count === reaction.count;
      });

    if (!isSame) {
      updateSlide({ emojiReactions: nextReactions });
    }

    setReactionCounts(
      slideId,
      nextReactions.reduce(
        (acc, reaction) => {
          acc[reaction.type] = reaction.count;
          return acc;
        },
        {} as Record<ReactionType, number>,
      ),
    );
    queryClient.setQueryData<Record<ReactionType, number>>(
      queryKeys.reactions.summary(slideId),
      () =>
        nextReactions.reduce(
          (acc, reaction) => {
            acc[reaction.type] = reaction.count;
            return acc;
          },
          {} as Record<ReactionType, number>,
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideId, reactionSummary]);

  const addReaction = (type: ReactionType) => {
    if (!slideId) return;

    // 전역 변수에 시간 기록 (슬라이드 ID 포함해서 유니크하게)
    globalLastActionTimes[`${slideId}-${type}`] = Date.now();

    // 낙관적 업데이트: 카운트 +1
    addReactionStore(type);

    const currentReactions = reactions.length > 0 ? reactions : createDefaultReactions();
    const nextReactions = currentReactions.map((reaction) => {
      if (reaction.type === type) {
        return { ...reaction, count: reaction.count + 1 };
      }
      return reaction;
    });

    queryClient.setQueryData<Record<ReactionType, number>>(
      queryKeys.reactions.summary(slideId),
      () =>
        nextReactions.reduce(
          (acc, reaction) => {
            acc[reaction.type] = reaction.count;
            return acc;
          },
          {} as Record<ReactionType, number>,
        ),
    );

    createReactionApi(
      { slideId, data: { emojiType: type } },
      {
        onError: () => {
          showToast.error('반응을 반영하지 못했습니다.');
          // 실패 시 서버 데이터로 리프레시
          void queryClient.invalidateQueries({ queryKey: queryKeys.reactions.summary(slideId) });
        },
      },
    );
  };

  return { reactions, addReaction };
}

export function useSlideReactionsTotal(projectId: string) {
  return useQuery({
    queryKey: queryKeys.reactions.total(projectId),
    queryFn: () => getTotalReactions(projectId),
    enabled: !!projectId,
  });
}
