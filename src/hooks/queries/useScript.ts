import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  BulkEditScriptsRequestDto,
  GetProjectScriptsResponseDto,
  GetScriptResponseDto,
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
import {
  DEMO_PROJECT_SCRIPTS,
  DEMO_SCRIPT_VERSIONS_BY_SLIDE_ID,
  getDemoScript,
  isDemoProject,
  isDemoSlideId,
} from '@/constants/demoProject';
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
    queryFn: () =>
      isDemoSlideId(slideId) ? Promise.resolve(getDemoScript(slideId)) : getScript(slideId),
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
    mutationFn: ({ slideId, projectId, data }: UpdateScriptMutationVariables) => {
      if (isDemoSlideId(slideId) || isDemoProject(projectId)) {
        return Promise.resolve({
          ...getDemoScript(slideId),
          scriptText: data.script,
          charCount: data.script.length,
          updatedAt: new Date().toISOString(),
        });
      }

      return updateScript(slideId, data);
    },

    onMutate: async ({ slideId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.scripts.detail(slideId) });
    },

    onSuccess: (savedScript, { slideId, projectId, data }) => {
      const clientScriptText = data.script;

      queryClient.setQueryData<GetScriptResponseDto>(queryKeys.scripts.detail(slideId), {
        ...savedScript,
        scriptText: clientScriptText,
        charCount: clientScriptText.length,
      });

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
              return { ...slide, script: clientScriptText };
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
              return { ...slide, script: clientScriptText };
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
                return { ...scriptItem, scriptText: clientScriptText };
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
              return { ...scriptItem, scriptText: clientScriptText };
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
    queryFn: () =>
      isDemoSlideId(slideId)
        ? Promise.resolve(DEMO_SCRIPT_VERSIONS_BY_SLIDE_ID[slideId] ?? [])
        : getScriptVersions(slideId),
    enabled: !!slideId,
  });
}

/**
 * 대본 복원
 */
export function useRestoreScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: RestoreScriptRequestDto }) => {
      if (isDemoSlideId(slideId)) {
        const versions = DEMO_SCRIPT_VERSIONS_BY_SLIDE_ID[slideId] ?? [];
        const matched = versions.find((item) => item.versionNumber === data.version);
        return Promise.resolve({
          ...getDemoScript(slideId),
          scriptText: matched?.scriptText ?? getDemoScript(slideId).scriptText,
          charCount: (matched?.scriptText ?? getDemoScript(slideId).scriptText).length,
          updatedAt: new Date().toISOString(),
        });
      }

      return restoreScript(slideId, data);
    },

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
    queryFn: () =>
      isDemoProject(projectId)
        ? Promise.resolve(DEMO_PROJECT_SCRIPTS)
        : getProjectScripts(projectId),
    enabled: !!projectId && isEnabled,
    staleTime: options?.staleTime,
  });
}

/**
 * 프로젝트 대본 일괄 수정
 */
export function useBulkEditScripts() {
  const queryClient = useQueryClient();
  type BulkEditOptimisticContext = {
    previousSlides?: SlideListItem[];
    hadSlidesQuery: boolean;
    previousProjectScripts?: GetProjectScriptsResponseDto;
    hadProjectScriptsQuery: boolean;
    previousScriptDetails: Array<{
      slideId: string;
      detail?: GetScriptResponseDto;
      hadDetailQuery: boolean;
    }>;
  };

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: BulkEditScriptsRequestDto }) =>
      bulkEditScripts(projectId, data),

    onMutate: async ({ projectId, data }): Promise<BulkEditOptimisticContext> => {
      await queryClient.cancelQueries({ queryKey: queryKeys.slides.list(projectId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.scripts.project(projectId) });
      await Promise.all(
        data.scripts.map(({ slideId }) =>
          queryClient.cancelQueries({ queryKey: queryKeys.scripts.detail(slideId) }),
        ),
      );

      const slidesQueryKey = queryKeys.slides.list(projectId);
      const projectScriptsQueryKey = queryKeys.scripts.project(projectId);
      const hadSlidesQuery = queryClient.getQueryState(slidesQueryKey) !== undefined;
      const hadProjectScriptsQuery =
        queryClient.getQueryState(projectScriptsQueryKey) !== undefined;

      const previousSlides = queryClient.getQueryData<SlideListItem[]>(slidesQueryKey);
      const previousProjectScripts =
        queryClient.getQueryData<GetProjectScriptsResponseDto>(projectScriptsQueryKey);
      const previousScriptDetails = data.scripts.map(({ slideId }) => {
        const detailQueryKey = queryKeys.scripts.detail(slideId);
        return {
          slideId,
          detail: queryClient.getQueryData<GetScriptResponseDto>(detailQueryKey),
          hadDetailQuery: queryClient.getQueryState(detailQueryKey) !== undefined,
        };
      });

      const nextScriptMap = new Map(
        data.scripts.map(({ slideId, scriptText }) => [slideId, scriptText]),
      );

      queryClient.setQueryData<SlideListItem[]>(slidesQueryKey, (slides) => {
        if (!slides) return slides;

        let hasUpdated = false;
        const nextSlides = slides.map((slide) => {
          const nextScriptText = nextScriptMap.get(slide.slideId);
          if (typeof nextScriptText !== 'string' || slide.script === nextScriptText) {
            return slide;
          }
          hasUpdated = true;
          return {
            ...slide,
            script: nextScriptText,
          };
        });

        return hasUpdated ? nextSlides : slides;
      });

      queryClient.setQueryData<GetProjectScriptsResponseDto>(
        projectScriptsQueryKey,
        (projectScripts) => {
          if (!projectScripts) return projectScripts;

          let hasUpdated = false;
          const nextScripts = projectScripts.scripts.map((scriptItem) => {
            const nextScriptText = nextScriptMap.get(scriptItem.slideId);
            if (typeof nextScriptText !== 'string' || scriptItem.scriptText === nextScriptText) {
              return scriptItem;
            }
            hasUpdated = true;
            return {
              ...scriptItem,
              scriptText: nextScriptText,
            };
          });

          if (!hasUpdated) return projectScripts;

          return {
            ...projectScripts,
            scripts: nextScripts,
          };
        },
      );

      data.scripts.forEach(({ slideId, scriptText }) => {
        queryClient.setQueryData<GetScriptResponseDto | undefined>(
          queryKeys.scripts.detail(slideId),
          (scriptDetail) => {
            if (!scriptDetail || scriptDetail.scriptText === scriptText) return scriptDetail;

            return {
              ...scriptDetail,
              scriptText,
            };
          },
        );
      });

      return {
        previousSlides,
        hadSlidesQuery,
        previousProjectScripts,
        hadProjectScriptsQuery,
        previousScriptDetails,
      };
    },

    onError: (_error, { projectId }, context) => {
      if (!context) return;

      const slidesQueryKey = queryKeys.slides.list(projectId);
      const projectScriptsQueryKey = queryKeys.scripts.project(projectId);

      if (context.hadSlidesQuery) {
        queryClient.setQueryData<SlideListItem[] | undefined>(
          slidesQueryKey,
          context.previousSlides,
        );
      } else {
        queryClient.removeQueries({ queryKey: slidesQueryKey, exact: true });
      }

      if (context.hadProjectScriptsQuery) {
        queryClient.setQueryData<GetProjectScriptsResponseDto | undefined>(
          projectScriptsQueryKey,
          context.previousProjectScripts,
        );
      } else {
        queryClient.removeQueries({ queryKey: projectScriptsQueryKey, exact: true });
      }

      context.previousScriptDetails.forEach(({ slideId, detail, hadDetailQuery }) => {
        const detailQueryKey = queryKeys.scripts.detail(slideId);
        if (hadDetailQuery) {
          queryClient.setQueryData<GetScriptResponseDto | undefined>(detailQueryKey, detail);
        } else {
          queryClient.removeQueries({ queryKey: detailQueryKey, exact: true });
        }
      });
    },

    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.list(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.project(projectId) });
    },
  });
}
