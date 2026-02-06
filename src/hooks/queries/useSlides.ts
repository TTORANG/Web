/**
 * 슬라이드 관련 TanStack Query 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateSlideTitleRequestDto } from '@/api/dto';
import { getSlides, updateSlide } from '@/api/endpoints/slides';
import { queryKeys } from '@/api/queryClient';

/** 슬라이드 목록 조회 */
export function useSlides(projectId: string) {
  return useQuery({
    queryKey: queryKeys.slides.list(projectId),
    queryFn: () => getSlides(projectId),
    enabled: !!projectId,
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
