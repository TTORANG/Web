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

interface UpdateScriptMutationVariables {
  slideId: string;
  projectId?: string;
  data: UpdateScriptRequestDto;
}

function getProjectIdFromListQueryKey(queryKey: readonly unknown[]): string | null {
  const projectId = queryKey[2];
  return typeof projectId === 'string' ? projectId : null;
}

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
    mutationFn: ({ slideId, data }: UpdateScriptMutationVariables) => updateScript(slideId, data),

    onMutate: async ({ slideId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.scripts.detail(slideId) });
    },

    onSuccess: (savedScript, { slideId, projectId }) => {
      queryClient.setQueryData(queryKeys.scripts.detail(slideId), savedScript);

      const matchedProjectIds = new Set<string>();

      const updateSlideListCache = (targetProjectId: string) => {
        queryClient.setQueryData<SlideListItem[]>(
          queryKeys.slides.list(targetProjectId),
          (slides) => {
            if (!slides) return slides;

            let hasUpdated = false;
            const nextSlides = slides.map((slide) => {
              if (slide.slideId !== slideId) return slide;
              hasUpdated = true;
              return { ...slide, script: savedScript.scriptText };
            });

            if (hasUpdated) {
              matchedProjectIds.add(targetProjectId);
              return nextSlides;
            }

            return slides;
          },
        );
      };

      if (projectId) {
        updateSlideListCache(projectId);
      } else {
        queryClient
          .getQueriesData<SlideListItem[]>({ queryKey: queryKeys.slides.lists() })
          .forEach(([queryKey, slides]) => {
            if (!slides) return;

            const keyProjectId = getProjectIdFromListQueryKey(queryKey);
            if (!keyProjectId) return;

            let hasUpdated = false;
            const nextSlides = slides.map((slide) => {
              if (slide.slideId !== slideId) return slide;
              hasUpdated = true;
              return { ...slide, script: savedScript.scriptText };
            });

            if (!hasUpdated) return;

            matchedProjectIds.add(keyProjectId);
            queryClient.setQueryData<SlideListItem[]>(queryKey, nextSlides);
          });
      }

      if (projectId) {
        matchedProjectIds.add(projectId);
      }

      if (matchedProjectIds.size > 0) {
        matchedProjectIds.forEach((matchedProjectId) => {
          queryClient.setQueryData<GetProjectScriptsResponseDto>(
            queryKeys.scripts.project(matchedProjectId),
            (projectScripts) => {
              if (!projectScripts) return projectScripts;

              let hasUpdated = false;
              const nextScripts = projectScripts.scripts.map((scriptItem) => {
                if (scriptItem.slideId !== slideId) return scriptItem;
                hasUpdated = true;
                return { ...scriptItem, scriptText: savedScript.scriptText };
              });

              if (!hasUpdated) return projectScripts;

              return {
                ...projectScripts,
                scripts: nextScripts,
              };
            },
          );
        });
      } else {
        // 슬라이드 목록 캐시가 비어있는 경우를 대비해 프로젝트 스크립트 캐시를 직접 탐색합니다.
        queryClient
          .getQueriesData<GetProjectScriptsResponseDto>({ queryKey: queryKeys.scripts.projects() })
          .forEach(([queryKey, projectScripts]) => {
            if (!projectScripts) return;

            let hasUpdated = false;
            const nextScripts = projectScripts.scripts.map((scriptItem) => {
              if (scriptItem.slideId !== slideId) return scriptItem;
              hasUpdated = true;
              return { ...scriptItem, scriptText: savedScript.scriptText };
            });

            if (!hasUpdated) return;

            queryClient.setQueryData<GetProjectScriptsResponseDto>(queryKey, {
              ...projectScripts,
              scripts: nextScripts,
            });
          });
      }

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
