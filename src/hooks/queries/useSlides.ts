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

type UseSlidesOptions = {
  enabled?: boolean;
  liveSync?: boolean;
  pollingIntervalMs?: number;
};

/**
 * 슬라이드 목록 조회
 *
 * @param projectId - 프로젝트 ID
 * @param options - 조회 옵션
 * @param options.enabled - 쿼리 활성화 여부 (기본값: true)
 * @param options.liveSync - 폴링 기반 라이브 동기화 여부 (기본값: false)
 * @param options.pollingIntervalMs - 라이브 동기화 폴링 간격(ms) (기본값: 15000)
 */
export function useSlides(
  projectId: string,
  { enabled: isEnabled = true, liveSync = false, pollingIntervalMs = 15000 }: UseSlidesOptions = {},
) {
  return useQuery({
    queryKey: queryKeys.slides.list(projectId),
    queryFn: () => getSlides(projectId),
    enabled: !!projectId && isEnabled,
    retry: false,
    refetchInterval: liveSync
      ? (query) => {
          const error = query.state.error;
          if (isAxiosError(error) && error.response?.status === 401) {
            return false;
          }
          return pollingIntervalMs;
        }
      : false,
    refetchIntervalInBackground: false,
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
        const optimisticTitle = data.title;
        queryClient.setQueryData<GetSlideResponseDto | undefined>(
          queryKeys.slides.detail(slideId),
          (old) => (old ? { ...old, title: optimisticTitle } : old),
        );
        queryClient.setQueriesData<SlideListItem[]>({ queryKey: queryKeys.slides.lists() }, (old) =>
          old?.map((item) =>
            item.slideId === slideId ? { ...item, title: optimisticTitle } : item,
          ),
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
