import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  BulkEditScriptsRequestDto,
  RestoreScriptRequestDto,
  UpdateScriptRequestDto,
} from '@/api/dto';
import {
  bulkEditScripts,
  getProjectScripts,
  getScript,
  getScriptVersions,
  restoreScript,
  updateScript,
} from '@/api/endpoints/scripts';
import { queryKeys } from '@/api/queryClient';

/**
 * 대본 조회
 *
 * @param slideId - 슬라이드 ID
 */
export function useScript(slideId: string) {
  return useQuery({
    queryKey: queryKeys.scripts.detail(slideId),
    queryFn: () => getScript(slideId),
    enabled: !!slideId,
  });
}

/**
 * 대본 저장
 */
export function useUpdateScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: UpdateScriptRequestDto }) =>
      updateScript(slideId, data),

    onMutate: async ({ slideId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.scripts.detail(slideId) });
    },

    onSuccess: (savedScript, { slideId }) => {
      queryClient.setQueryData(queryKeys.scripts.detail(slideId), savedScript);
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.versions(slideId) });
    },
  });
}

/**
 * 대본 버전(히스토리) 목록 조회
 *
 * @param slideId - 슬라이드 ID
 */
export function useScriptVersions(slideId: string) {
  return useQuery({
    queryKey: queryKeys.scripts.versions(slideId),
    queryFn: () => getScriptVersions(slideId),
    enabled: !!slideId,
  });
}

/**
 * 대본 복원
 */
export function useRestoreScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: RestoreScriptRequestDto }) =>
      restoreScript(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.detail(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.versions(slideId) });
    },
  });
}

/**
 * 프로젝트 전체 대본 조회
 */
export function useProjectScripts(projectId: string) {
  return useQuery({
    queryKey: queryKeys.scripts.project(projectId),
    queryFn: () => getProjectScripts(projectId),
    enabled: !!projectId,
  });
}

/**
 * 프로젝트 대본 일괄 수정
 */
export function useBulkEditScripts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: BulkEditScriptsRequestDto }) =>
      bulkEditScripts(projectId, data),

    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.list(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.project(projectId) });
    },
  });
}
