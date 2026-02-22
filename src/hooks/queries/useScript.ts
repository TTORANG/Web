import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  BulkEditScriptsRequestDto,
  GetProjectScriptsResponseDto,
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
import type { SlideListItem } from '@/types/slide';

/**
 * 대본 조회
 *
 * @param slideId - 슬라이드 ID
 */
export function useScript(
  slideId: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  },
) {
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.scripts.detail(slideId),
    queryFn: () => getScript(slideId),
    enabled: !!slideId && isEnabled,
    staleTime: options?.staleTime,
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

      queryClient.setQueriesData<SlideListItem[]>({ queryKey: queryKeys.slides.lists() }, (old) => {
        if (!old) return old;

        let hasUpdated = false;
        const next = old.map((slide) => {
          if (slide.slideId !== slideId) return slide;
          hasUpdated = true;
          return { ...slide, script: savedScript.scriptText };
        });

        return hasUpdated ? next : old;
      });

      queryClient.setQueriesData<GetProjectScriptsResponseDto>(
        { queryKey: queryKeys.scripts.projects() },
        (old) => {
          if (!old) return old;
          if (!Array.isArray(old.scripts)) return old;

          let hasUpdated = false;
          const nextScripts = old.scripts.map((scriptItem) => {
            if (scriptItem.slideId !== slideId) return scriptItem;
            hasUpdated = true;
            return { ...scriptItem, scriptText: savedScript.scriptText };
          });

          if (!hasUpdated) return old;

          return {
            ...old,
            scripts: nextScripts,
          };
        },
      );

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
export function useProjectScripts(
  projectId: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  },
) {
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.scripts.project(projectId),
    queryFn: () => getProjectScripts(projectId),
    enabled: !!projectId && isEnabled,
    staleTime: options?.staleTime,
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
