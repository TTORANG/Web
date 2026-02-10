import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type ToggleVideoReactionRequest,
  getVideoReactionBuckets,
  getVideoReactionTimeline,
  getVideoReactions,
  toggleVideoReaction,
} from '@/api/endpoints/videoReactions';
import { queryKeys } from '@/api/queryClient';

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

export function useVideoReactionTimeline(videoId: string | undefined, intervalMs = 5000) {
  return useQuery({
    queryKey: queryKeys.reactions.video.timeline(videoId ?? '', intervalMs),
    queryFn: () => getVideoReactionTimeline(videoId!, { intervalMs }),
    enabled: !!videoId,
  });
}

export function useVideoReactionBuckets(videoId: string | undefined, intervalMs = 5000) {
  return useQuery({
    queryKey: queryKeys.reactions.video.buckets(videoId ?? '', intervalMs),
    queryFn: () => getVideoReactionBuckets(videoId!, { intervalMs }),
    enabled: !!videoId,
  });
}
