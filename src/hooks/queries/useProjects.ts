/**
 * 프로젝트 관련 TanStack Query 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import {
  type UpdateProjectRequest,
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '@/api/endpoints/projects';

/** 프로젝트 목록 조회 */
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: getProjects,
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
    onSuccess: () => {
      // 프로젝트 목록 다시 받기
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.details() });
    },
  });
}
