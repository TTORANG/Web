/**
 * 슬라이드 관련 TanStack Query 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import type { UpdateSlideTitleRequestDto } from '@/api/dto';
import { getSlides, updateSlide } from '@/api/endpoints/slides';
import { MAX_RETRIES, queryKeys } from '@/api/queryClient';

/** 슬라이드 목록 조회 */
export function useSlides(projectId: string) {
  return useQuery({
    queryKey: queryKeys.slides.list(projectId),
    queryFn: () => getSlides(projectId),
    enabled: !!projectId,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return failureCount < MAX_RETRIES;
    },
    // 🔄 서버가 웹소켓 브로드캐스트를 안하므로 임시로 폴링 추가
    // TODO: 서버에서 broadcastNewComment 호출 후 제거
    refetchInterval: (query) => {
      const error = query.state.error;
      if (isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return 3000;
    }, // 3초마다 자동 갱신
    refetchIntervalInBackground: false, // 탭이 백그라운드일 때는 멈춤
  });
}

/** 슬라이드 수정 */
export function useUpdateSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: UpdateSlideTitleRequestDto }) =>
      updateSlide(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
    },
  });
}
