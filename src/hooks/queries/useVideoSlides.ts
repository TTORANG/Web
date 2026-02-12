import { useQuery } from '@tanstack/react-query';

import type { ReadVideoSlidesResponseDto } from '@/api/dto/video.dto';
import { videosApi } from '@/api/endpoints/videos';
import { queryKeys } from '@/api/queryClient';

export function useVideoSlides(videoId: number) {
  return useQuery({
    queryKey: queryKeys.videos.slides(videoId),
    queryFn: async (): Promise<ReadVideoSlidesResponseDto> => {
      const response = await videosApi.getVideoSlides(String(videoId));

      if (response.data.resultType === 'FAILURE') {
        throw new Error(
          response.data.error?.reason || '영상 슬라이드 타임라인을 불러올 수 없습니다.',
        );
      }

      return response.data.success;
    },
    enabled: !!videoId,
  });
}
