import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type ToggleVideoReactionRequest,
  getVideoReactionTimeline,
  getVideoReactions,
  toggleVideoReaction,
} from '@/api/endpoints/videoReactions';
import { queryKeys } from '@/api/queryClient';

/**
 * 영상 리액션 토글 Mutation 훅
 *
 * 성공 시 해당 영상 상세 캐시를 무효화합니다.
 */
export function useToggleVideoReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: ToggleVideoReactionRequest }) =>
      toggleVideoReaction(videoId, data),

    onSuccess: (_, { videoId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reactions.video.all(videoId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
    },
  });
}

/**
 * 영상 리액션 구간 집계 조회
 */
export function useVideoReactionWindow(
  videoId: string | undefined,
  timestampMs: number | undefined,
  windowMs = 2000,
) {
  return useQuery({
    queryKey: queryKeys.reactions.video.window(videoId ?? '', timestampMs ?? 0, windowMs),
    queryFn: () => getVideoReactions(videoId!, { timestampMs: timestampMs!, windowMs }),
    enabled: !!videoId && Number.isFinite(timestampMs),
  });
}

/**
 * 영상 리액션 타임라인 조회
 */
export function useVideoReactionTimeline(videoId: string | undefined, intervalMs = 5000) {
  return useQuery({
    queryKey: queryKeys.reactions.video.timeline(videoId ?? '', intervalMs),
    queryFn: () => getVideoReactionTimeline(videoId!, { intervalMs }),
    enabled: !!videoId,
  });
}
