/**
 * 프로젝트 관련 TanStack Query 훅
 *
 * @file useProjects.ts
 * @description 프로젝트 조회 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import { getProject } from '@/api/endpoints/projects';
import {
  type UpdateProjectRequest,
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '@/api/endpoints/projects';
import type { Project } from '@/types';
import { showToast } from '@/utils/toast';

/** 프로젝트 목록 조회 */
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: getProjects,
  });
}

/** 특정 프로젝트 조회 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });
}

/** 프로젝트 수정 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectRequest }) =>
      updateProject(projectId, data),

    onSuccess: (_, { projectId }) => {
      // 1) 해당 프로젝트 detail 최신화
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      //2) 목록 갱신
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}

/** 프로젝트 생성 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string }) => createProject(data),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}

/** 프로젝트 삭제 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: (_, projectId) => {
      // 1) 목록 캐시에서 삭제된 프로젝트를 제거하여 즉시 UI에 반영합니다.
      queryClient.setQueryData<Project[]>(queryKeys.projects.lists(), (oldData) =>
        oldData?.filter((project) => project.id !== projectId),
      );
      // 상세 정보 캐시는 API 응답으로 받은 데이터로 직접 업데이트합니다.
      void queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
    onError: () => {
      showToast.error('삭제 실패', '잠시 후 다시 시도해 주세요.');
    },
  });
}
