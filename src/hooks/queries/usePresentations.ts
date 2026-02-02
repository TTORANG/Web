/**
 * 프로젝트 관련 TanStack Query 훅
 *
 * @file usePresentation.ts
 * @description 프로젝트 조회 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import type { UpdateProjectDto } from '@/api/dto';
import { getPresentations } from '@/api/endpoints/presentations';
import {
  createPresentation,
  deletePresentation,
  getPresentation,
  updatePresentation,
} from '@/api/endpoints/presentations';
import type { CreatePresentationRequest, Presentation } from '@/types/presentation';
import { showToast } from '@/utils/toast';

/** 프로젝트 목록 조회 */
export function usePresentations() {
  return useQuery({
    queryKey: queryKeys.presentations.lists(),
    queryFn: getPresentations,
  });
}

/** 특정 프로젝트 조회 */
export function usePresentation(projectId: string) {
  return useQuery({
    queryKey: queryKeys.presentations.detail(projectId),
    queryFn: () => getPresentation(),
    enabled: !!projectId,
  });
}

/** 프로젝트 수정 */
export function useUpdatePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectDto }) =>
      updatePresentation(projectId, data),

    onSuccess: (updatePresentation) => {
      // Detail 캐시는 API 응답으로 직접 업데이트 (네트워크 절약)
      queryClient.setQueryData(
        queryKeys.presentations.detail(updatePresentation.projectId),
        updatePresentation,
      );
      // 목록은 최신 데이터 반영을 위해 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.presentations.lists() });
    },
  });
}

/** 프로젝트 생성 */
export function useCreatePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePresentationRequest) => createPresentation(data),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.presentations.lists() });
    },
  });
}

/** 프로젝트 삭제 */
export function useDeletePresentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deletePresentation(projectId),
    onSuccess: (_, projectId) => {
      // 1) 목록 캐시에서 삭제된 프로젝트를 제거하여 즉시 UI에 반영합니다.
      queryClient.setQueryData<Presentation[]>(queryKeys.presentations.lists(), (oldData) =>
        oldData?.filter((project) => project.projectId !== projectId),
      );
      // 상세 정보 캐시는 API 응답으로 받은 데이터로 직접 업데이트합니다.
      void queryClient.removeQueries({ queryKey: queryKeys.presentations.detail(projectId) });
    },
    onError: () => {
      showToast.error('삭제 실패', '잠시 후 다시 시도해 주세요.');
    },
  });
}
