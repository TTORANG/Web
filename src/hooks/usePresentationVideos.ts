import { useQuery } from '@tanstack/react-query';

import { videosApi } from '@/api/endpoints/videos';
import { queryKeys } from '@/api/queryClient';
import type { FilterMode, SortMode } from '@/types/home';
import type { VideoPresentation } from '@/types/video';

export interface UsePresentationVideosParams {
  projectId: string;
  search?: string;
  filter?: FilterMode;
  sort?: SortMode;
}

export function usePresentationVideos({
  projectId,
  search,
  filter,
  sort,
}: UsePresentationVideosParams) {
  const normalizedFilter = filter && filter !== 'all' ? filter : undefined;
  const normalizedSort = sort || undefined;

  return useQuery({
    queryKey: queryKeys.videos.list(projectId, {
      search,
      filter: normalizedFilter,
      sort: normalizedSort,
    }),
    queryFn: async () => {
      const response = await videosApi.getPresentationVideos(projectId, {
        search,
        filter: normalizedFilter,
        sort: normalizedSort,
      });

      if (response.data.resultType === 'FAILURE') {
        throw new Error(response.data.error?.reason || 'Failed to fetch videos');
      }

      return response.data.success;
    },
    select: (data) => {
      if (!data) return { videos: [], total: 0 };

      const videos: VideoPresentation[] = data.videos.map((video) => ({
        // Presentation 필드들
        projectId: projectId,
        title: video.title || '제목 없음',
        thumbnailUrl: video.thumbnailUrl || undefined,
        slideCount: 0, // 서버에서 제공하지 않으므로 0으로 설정
        feedbackCount: video.feedbackCount || 0,
        reactionCount: video.reactionCount || 0,
        viewCount: video.viewCount || 0,
        durationSeconds: video.durationSeconds || 0,
        userName: undefined, // 서버에서 제공하지 않음
        createdAt: video.createdAt,
        updatedAt: video.createdAt, // 서버에서 updatedAt을 제공하지 않으므로 createdAt 사용

        // VideoPresentation 고유 필드들
        videoId: video.videoId,
        commentCount: video.feedbackCount || 0,
        downloadUrl: video.hlsMasterUrl,
        status: video.status,
      }));

      return {
        videos,
        total: data.total || data.videos.length,
      };
    },
  });
}
