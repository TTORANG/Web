import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type ToggleVideoReactionRequest,
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
    },
  });
}
