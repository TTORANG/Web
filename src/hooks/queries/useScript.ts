/**
 * @file useScript.ts
 * @description 대본 관련 React Query 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type RestoreScriptRequest,
  type UpdateScriptRequest,
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
    mutationFn: ({ slideId, data }: { slideId: string; data: UpdateScriptRequest }) =>
      updateScript(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.detail(slideId) });
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
    mutationFn: ({ slideId, data }: { slideId: string; data: RestoreScriptRequest }) =>
      restoreScript(slideId, data),

    onSuccess: (_, { slideId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.detail(slideId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scripts.versions(slideId) });
    },
  });
}
