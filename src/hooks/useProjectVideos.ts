import { useQuery } from '@tanstack/react-query';

import { videosApi } from '@/api/endpoints/videos';
import type { FilterMode, SortMode } from '@/types/home';
import type { VideoPresentation } from '@/types/video';

export interface UseProjectVideosParams {
  projectId: string;
  search?: string;
  filter?: FilterMode;
  sort?: SortMode;
}

export function useProjectVideos({ projectId, search, filter, sort }: UseProjectVideosParams) {
  return useQuery({
    queryKey: ['videos', projectId, search, filter, sort],
    queryFn: async () => {
      const response = await videosApi.getProjectVideos(projectId, {
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
          projectId: video.videoId, // videoId를 projectId로 사용
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          slideCount: 0,
          feedbackCount: (video.rootCommentCount || 0) + (video.replyCount || 0), // null 체크 추가
          commentCount: (video.rootCommentCount || 0) + (video.replyCount || 0),
          durationSeconds: video.durationSeconds || 0,
          createdAt: video.createdAt,
          updatedAt: video.createdAt,
          reactionCount: video.reactionCount || 0,
          viewCount: video.viewCount || 0,
          status: video.status,
        })) as VideoPresentation[],
        total: data.total,
      };
    },
  });
}
