import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import type { GetPresentationsRequestDto, UpdatePresentationRequestDto } from '@/api/dto';
import { getPresentations } from '@/api/endpoints/presentations';
import {
  deletePresentation,
  getPresentation,
  updatePresentation,
} from '@/api/endpoints/presentations';
import type { Presentation, PresentationListResponse } from '@/types/presentation';
import { showToast } from '@/utils/toast';

/**
 * 프로젝트 목록 조회
 *
 * 전체 프로젝트 목록을 가져옵니다.
 */
export function usePresentations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.presentations.lists(),
    queryFn: () => getPresentations(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * 프로젝트 목록 조회 (필터/검색/정렬 지원)
 */
export function usePresentationsWithFilters(
  params: GetPresentationsRequestDto,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.presentations.list(params),
    queryFn: () => getPresentations(params),
    enabled: options?.enabled ?? true,
  });
}

/**
 * 특정 프로젝트 조회
 *
 * @param projectId - 프로젝트 ID
 */
export function usePresentation(projectId: string) {
  return useQuery({
    queryKey: queryKeys.presentations.detail(projectId),
    queryFn: () => getPresentation(projectId),
    enabled: !!projectId,
  });
}

/**
 * 프로젝트 수정 Mutation 훅
 *
 * 성공 시 상세 캐시를 응답으로 직접 업데이트하고, 목록 캐시를 무효화합니다.
 */
export function useUpdatePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdatePresentationRequestDto }) =>
      updatePresentation(projectId, data),

    onSuccess: (updatePresentation) => {
      // Detail 캐시는 기존 데이터에 title/updatedAt만 반영
      queryClient.setQueryData<Presentation | undefined>(
        queryKeys.presentations.detail(updatePresentation.projectId),
        (old) =>
          old
            ? { ...old, title: updatePresentation.title, updatedAt: updatePresentation.updatedAt }
            : old,
      );
      // 목록 캐시는 즉시 업데이트 (화면 전환 시 반영 지연 방지)
      queryClient.setQueriesData<PresentationListResponse>(
        { queryKey: queryKeys.presentations.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          const nextPresentations = oldData.presentations.map((item) =>
            item.projectId === updatePresentation.projectId
              ? {
                  ...item,
                  title: updatePresentation.title,
                  updatedAt: updatePresentation.updatedAt,
                }
              : item,
          );
          return {
            ...oldData,
            presentations: nextPresentations,
          };
        },
      );
      // 목록은 최신 데이터 반영을 위해 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.presentations.lists() });
    },
  });
}

/**
 * 프로젝트 삭제 Mutation 훅
 *
 * 성공 시 목록 캐시에서 즉시 제거하고, 상세 캐시를 삭제합니다.
 */
export function useDeletePresentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deletePresentation(projectId),
    onSuccess: (_, projectId) => {
      // 1) 목록 캐시에서 삭제된 프로젝트를 제거하여 즉시 UI에 반영합니다.
      queryClient.setQueriesData<PresentationListResponse>(
        { queryKey: queryKeys.presentations.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          const nextPresentations = oldData.presentations.filter(
            (project) => project.projectId !== projectId,
          );
          if (nextPresentations.length === oldData.presentations.length) return oldData;

          const nextTotal = Math.max(0, oldData.total - 1);
          const nextTotalPages = Math.max(1, Math.ceil(nextTotal / Math.max(1, oldData.limit)));

          return {
            ...oldData,
            presentations: nextPresentations,
            total: nextTotal,
            totalPages: nextTotalPages,
          };
        },
      );
      // 상세 정보 캐시는 API 응답으로 받은 데이터로 직접 업데이트합니다.
      void queryClient.removeQueries({ queryKey: queryKeys.presentations.detail(projectId) });
    },
    onError: () => {
      showToast.error('삭제하지 못했습니다.', '잠시 후 다시 시도해주세요.');
    },
  });
}
