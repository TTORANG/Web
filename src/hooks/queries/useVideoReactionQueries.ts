/**
 * 영상 리액션 관련 TanStack Query 훅
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type ToggleVideoReactionRequest,
  toggleVideoReaction,
} from '@/api/endpoints/videoReactions';
import { queryKeys } from '@/api/queryClient';

/** 영상 리액션 토글 */
export function useToggleVideoReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: ToggleVideoReactionRequest }) =>
      toggleVideoReaction(videoId, data),

    onSuccess: (_, { videoId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
    },
  });
}
