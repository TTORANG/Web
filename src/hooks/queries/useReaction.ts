import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateSlideReactionDto } from '@/api';
import { createReaction, getSlideReactionSummary } from '@/api/endpoints/reactions';
import { queryKeys } from '@/api/queryClient';
import { getDemoSlideReactionSummary, isDemoSlideId } from '@/constants/demoProject';

/**
 * 여러 슬라이드의 리액션 집계 조회
 *
 * @param slideIds - 조회할 슬라이드 ID 배열
 */
export function useSlideReactionSummaries(slideIds: string[]) {
  const isAllDemoSlides =
    slideIds.length > 0 && slideIds.every((slideId) => isDemoSlideId(slideId));

  return useQuery({
    queryKey: queryKeys.reactions.summary(slideIds.join('|')),
    queryFn: () =>
      isAllDemoSlides
        ? Promise.resolve(slideIds.map((slideId) => getDemoSlideReactionSummary(slideId)))
        : Promise.all(slideIds.map((slideId) => getSlideReactionSummary(slideId))),
    enabled: slideIds.length > 0,
  });
}

/**
 * 단일 슬라이드 리액션 집계 조회
 *
 * @param slideId - 조회할 슬라이드 ID
 */
export function useSlideReactionSummary(slideId?: string) {
  const isDemoSlide = isDemoSlideId(slideId);

  return useQuery({
    queryKey: queryKeys.reactions.summary(slideId ?? ''),
    queryFn: () => {
      if (!slideId) {
        return Promise.resolve(null);
      }
      if (isDemoSlide) {
        return Promise.resolve(getDemoSlideReactionSummary(slideId));
      }
      return getSlideReactionSummary(slideId);
    },
    enabled: !!slideId,
  });
}

/**
 * 슬라이드 리액션 생성 Mutation 훅
 *
 * 요청 1회 = 카운트 1 증가 (토글 아님)
 * 성공 시 해당 슬라이드의 리액션 집계 캐시를 무효화합니다.
 */
export function useCreateReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: CreateSlideReactionDto }) => {
      if (isDemoSlideId(slideId)) {
        return Promise.resolve({
          slideId,
          emojiType: data.emojiType,
        });
      }

      return createReaction(slideId, data);
    },
    meta: {
      // 연타 시 에러 토스트를 표시하지 않음 (사용자 경험 개선)
      suppressErrorToast: true,
    },
    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reactions.summary(slideId) });
    },
  });
}
