/**
 * 슬라이드 관련 TanStack Query 훅
 */
import type { QueryKey } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import type { GetSlideResponseDto, UpdateSlideTitleRequestDto } from '@/api/dto';
import { getSlides, updateSlide } from '@/api/endpoints/slides';
import { queryKeys } from '@/api/queryClient';
import type { SlideListItem } from '@/types/slide';

/**
 * 슬라이드 목록 조회
 *
 * @param projectId - 프로젝트 ID
 */
export function useSlides(projectId: string) {
  return useQuery({
    queryKey: queryKeys.slides.list(projectId),
    queryFn: () => getSlides(projectId),
    enabled: !!projectId,
    retry: false,
    // 🔄 서버가 웹소켓 브로드캐스트를 안하므로 임시로 폴링 추가
    // TODO: 서버에서 broadcastNewComment 호출 후 제거
    refetchInterval: (query) => {
      const error = query.state.error;
      if (isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return 3000;
    }, // 3초마다 자동 갱신 (401이면 중단)
    refetchIntervalInBackground: false, // 탭이 백그라운드일 때는 멈춤
  });
}

/**
 * 슬라이드 수정 Mutation 훅
 *
 * 성공 시 슬라이드 상세/목록 캐시를 무효화합니다.
 */
export function useUpdateSlide() {
  const queryClient = useQueryClient();

  type OptimisticContext = {
    previousDetail?: GetSlideResponseDto;
    previousLists: Array<[QueryKey, SlideListItem[] | undefined]>;
  };

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: UpdateSlideTitleRequestDto }) =>
      updateSlide(slideId, data),

    onMutate: async ({ slideId, data }): Promise<OptimisticContext> => {
      await queryClient.cancelQueries({ queryKey: queryKeys.slides.detail(slideId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.slides.lists() });

      const previousDetail = queryClient.getQueryData<GetSlideResponseDto>(
        queryKeys.slides.detail(slideId),
      );
      const previousLists = queryClient.getQueriesData<SlideListItem[]>({
        queryKey: queryKeys.slides.lists(),
      });

      if (typeof data.title === 'string') {
        queryClient.setQueryData<GetSlideResponseDto | undefined>(
          queryKeys.slides.detail(slideId),
          (old) => (old ? { ...old, title: data.title } : old),
        );
        queryClient.setQueriesData<SlideListItem[]>({ queryKey: queryKeys.slides.lists() }, (old) =>
          old?.map((item) => (item.slideId === slideId ? { ...item, title: data.title } : item)),
        );
      }

      return { previousDetail, previousLists };
    },

    onError: (_error, { slideId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.slides.detail(slideId), context.previousDetail);
      }

      context?.previousLists.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },

    onSuccess: (savedSlide, { slideId }) => {
      queryClient.setQueryData<GetSlideResponseDto | undefined>(
        queryKeys.slides.detail(slideId),
        (old) =>
          old
            ? {
                ...old,
                title: savedSlide.title,
                slideNum: savedSlide.slideNum,
                imageUrl: savedSlide.imageUrl,
                updatedAt: savedSlide.updatedAt,
              }
            : old,
      );
      queryClient.setQueriesData<SlideListItem[]>({ queryKey: queryKeys.slides.lists() }, (old) =>
        old?.map((item) =>
          item.slideId === slideId
            ? {
                ...item,
                title: savedSlide.title,
                slideNum: savedSlide.slideNum,
                imageUrl: savedSlide.imageUrl,
                updatedAt: savedSlide.updatedAt,
              }
            : item,
        ),
      );
    },

    onSettled: (_data, _error, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
    },
  });
}
