import { useQuery } from '@tanstack/react-query';

import { videosApi } from '@/api/endpoints/videos';
import type { FilterMode, SortMode } from '@/types/home';
import type { VideoPresentation } from '@/types/video';

export interface UseMyVideosParams {
  search?: string;
  filter?: FilterMode;
  sort?: SortMode;
}

export function useMyVideos({ search, filter, sort }: UseMyVideosParams = {}) {
  return useQuery({
    queryKey: ['videos', 'me', search, filter, sort],
    queryFn: async () => {
      const response = await videosApi.getMyVideos({
        search,
        filter: filter && filter !== 'all' ? filter : undefined,
        sort: sort || undefined,
      });

      if (response.data.resultType === 'FAILURE') {
        throw new Error(response.data.error?.reason || 'Failed to fetch videos');
      }

      return response.data.success;
    },
    select: (data) => {
      if (!data) {
        return { videos: [], total: 0 };
      }

      return {
        videos: data.videos.map((video) => ({
          projectId: video.videoId,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          slideCount: 0, // 슬라이드 수는 API에서 제공하지 않으므로 0으로 설정
          commentCount: video.rootCommentCount + video.replyCount,
          feedbackCount: video.rootCommentCount + video.replyCount,
          durationSeconds: video.durationSeconds,
          createdAt: video.createdAt,
          updatedAt: video.createdAt,
          reactionCount: video.reactionCount,
          viewCount: video.viewCount,
          status: video.status,
        })) as VideoPresentation[],
        total: data.videos.length,
      };
    },
  });
}
