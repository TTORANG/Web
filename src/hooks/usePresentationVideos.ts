import { useQuery } from '@tanstack/react-query';

import { videosApi } from '@/api/endpoints/videos';
import { queryKeys } from '@/api/queryClient';
import { DEMO_VIDEO_LIST_ITEMS, isDemoProject } from '@/constants/demoProject';
import type { FilterMode, SortMode } from '@/types/home';
import type { VideoPresentation } from '@/types/video';

export interface UsePresentationVideosParams {
  projectId: string;
  search?: string;
  filter?: FilterMode;
  sort?: SortMode;
  enabled?: boolean;
}

export function usePresentationVideos({
  projectId,
  search,
  filter,
  sort,
  enabled = true,
}: UsePresentationVideosParams) {
  const normalizedFilter = filter && filter !== 'all' ? filter : undefined;
  const normalizedSort = sort || undefined;
  const isDemo = isDemoProject(projectId);

  return useQuery({
    enabled: enabled && Boolean(projectId),
    queryKey: queryKeys.videos.list(projectId, {
      search,
      filter: normalizedFilter,
      sort: normalizedSort,
    }),
    queryFn: async () => {
      if (isDemo) {
        return {
          videos: DEMO_VIDEO_LIST_ITEMS,
          total: DEMO_VIDEO_LIST_ITEMS.length,
        };
      }

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

      const mappedVideos: VideoPresentation[] = data.videos.map((video) => ({
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

      if (!isDemo) {
        return {
          videos: mappedVideos,
          total: data.total || data.videos.length,
        };
      }

      const normalizedQuery = search?.trim().toLowerCase() ?? '';
      const searched = normalizedQuery
        ? mappedVideos.filter((video) => video.title.toLowerCase().includes(normalizedQuery))
        : mappedVideos;

      const filtered = searched.filter((video) => {
        if (normalizedFilter === '3m') return video.durationSeconds <= 180;
        if (normalizedFilter === '5m') return video.durationSeconds <= 300;
        return true;
      });

      const sorted = [...filtered].sort((a, b) => {
        if (normalizedSort === 'commentCount') {
          return (b.commentCount ?? 0) - (a.commentCount ?? 0);
        }
        if (normalizedSort === 'name') {
          return a.title.localeCompare(b.title, 'ko');
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return {
        videos: sorted,
        total: sorted.length,
      };
    },
  });
}
