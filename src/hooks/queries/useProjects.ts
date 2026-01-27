/**
 * @file useProjects.ts
 * @description 프로젝트 조회 훅
 */
import { useQuery } from '@tanstack/react-query';

import { getProject } from '@/api/endpoints/projects';
import { queryKeys } from '@/api/queryClient';

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });
}
