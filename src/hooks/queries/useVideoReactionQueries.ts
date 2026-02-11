import { useMemo } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ReadVideoReactionBucketsResponseDto } from '@/api/dto/reactions.dto';
import {
  type ToggleVideoReactionRequest,
  getVideoReactionBuckets,
  getVideoReactions,
  toggleVideoReaction,
} from '@/api/endpoints/videoReactions';
import { queryKeys } from '@/api/queryClient';
import type { ReactionType } from '@/types/script';
import type { SegmentHighlight } from '@/types/video';

const REACTION_PRIORITY_ORDER: ReactionType[] = ['fire', 'sleepy', 'good', 'bad', 'confused'];

/**
 * 버킷에 포함된 모든 리액션 개수를 합산한다.
 */
const getBucketTotalCount = (reactions: Record<ReactionType, number>) =>
  REACTION_PRIORITY_ORDER.reduce((sum, type) => sum + (reactions[type] ?? 0), 0);

/**
 * 버킷에서 가장 많이 눌린 이모지를 찾는다.
 * 동점이면 REACTION_PRIORITY_ORDER 순서를 우선한다.
 */
const getBucketTopReaction = (
  reactions: Record<ReactionType, number>,
): { emojiType: ReactionType; count: number } | null => {
  let topType: ReactionType | null = null;
  let topCount = 0;

  for (const reactionType of REACTION_PRIORITY_ORDER) {
    const count = reactions[reactionType] ?? 0;
    if (count > topCount) {
      topType = reactionType;
      topCount = count;
    }
  }

  if (!topType || topCount <= 0) return null;

  return { emojiType: topType, count: topCount };
};

/**
 * 버킷 응답을 재생바 표시용 하이라이트 데이터로 변환한다.
 * 1) 각 버킷 총합 계산
 * 2) 총합 기준 상위 N개 선택
 * 3) 화면 표시를 위해 시간순으로 재정렬
 */
const buildHighlightsFromBuckets = (
  bucketResponse: ReadVideoReactionBucketsResponseDto,
  duration: number,
  topN: number,
): SegmentHighlight[] => {
  if (!bucketResponse.buckets.length || duration <= 0) return [];

  const intervalSec = bucketResponse.intervalMs / 1000;
  const highlights = bucketResponse.buckets
    .map((bucket) => {
      const totalCount = getBucketTotalCount(bucket.reactions);
      const topReaction = getBucketTopReaction(bucket.reactions);
      if (!topReaction || totalCount <= 0) return null;

      const startTime = bucket.timestampMs / 1000;
      const endTime = Math.min(startTime + intervalSec, duration);

      return {
        startTime,
        endTime,
        topReactionType: topReaction.emojiType,
        count: topReaction.count,
        totalCount,
      } as SegmentHighlight;
    })
    .filter((item): item is SegmentHighlight => item !== null);

  // totalCount가 같을 때, 앞에 있는 버킷을 우선시 한다.
  return highlights
    .slice()
    .sort((a, b) => b.totalCount - a.totalCount || a.startTime - b.startTime)
    .slice(0, topN)
    .sort((a, b) => a.startTime - b.startTime);
};

export function useToggleVideoReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: ToggleVideoReactionRequest }) =>
      toggleVideoReaction(videoId, data),
    onSuccess: (_, { videoId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reactions.video.all(videoId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reactions.video.buckets(videoId),
      });
    },
  });
}

export function useVideoReactionWindow(
  videoId: string | undefined,
  timestampMs: number | undefined,
  windowMs = 2000,
) {
  return useQuery({
    queryKey: queryKeys.reactions.video.window(videoId ?? '', timestampMs ?? 0, windowMs),
    queryFn: () => getVideoReactions(videoId!, { timestampMs: timestampMs!, windowMs }),
    placeholderData: (previousData) => previousData,
    enabled: !!videoId && Number.isFinite(timestampMs),
  });
}

/**
 * 영상 리액션 버킷 데이터를 조회한다.
 * 각 버킷에는 전체 이모지별 count가 포함된다.
 */
export function useVideoReactionBuckets(videoId: string | undefined, intervalMs = 5000) {
  return useQuery({
    queryKey: queryKeys.reactions.video.buckets(videoId ?? '', intervalMs),
    queryFn: () => getVideoReactionBuckets(videoId!, { intervalMs }),
    enabled: !!videoId,
  });
}

/**
 * 재생바 표시용 하이라이트를 계산해서 반환한다.
 * - 버킷 전체 리액션 합산 기준 상위 N개 선택
 * - 선택된 버킷마다 최다 이모지를 대표로 사용
 */
export function useVideoReactionHighlights(
  videoId: string | undefined,
  duration: number,
  options?: {
    intervalMs?: number;
    topN?: number;
  },
) {
  const intervalMs = options?.intervalMs ?? 5000;
  const topN = options?.topN ?? 10;
  const bucketQuery = useVideoReactionBuckets(videoId, intervalMs);

  const segmentHighlights = useMemo(() => {
    if (!bucketQuery.data) return [];
    return buildHighlightsFromBuckets(bucketQuery.data, duration, topN);
  }, [bucketQuery.data, duration, topN]);

  return {
    ...bucketQuery,
    segmentHighlights,
  };
}
