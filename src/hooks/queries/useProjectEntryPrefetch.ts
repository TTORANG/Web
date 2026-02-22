import { useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { getProjectScripts } from '@/api/endpoints/scripts';
import { getSlides } from '@/api/endpoints/slides';
import { queryKeys } from '@/api/queryClient';

/**
 * 프로젝트 진입 시 슬라이드/대본 데이터를 한 번 미리 적재합니다.
 */
export function useProjectEntryPrefetch(projectId?: string) {
  const queryClient = useQueryClient();
  const prefetchedProjectIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!projectId) return;
    if (prefetchedProjectIdsRef.current.has(projectId)) return;

    prefetchedProjectIdsRef.current.add(projectId);

    void Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.slides.list(projectId),
        queryFn: () => getSlides(projectId),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.scripts.project(projectId),
        queryFn: () => getProjectScripts(projectId),
      }),
    ]).catch(() => {
      // 실패 시 재시도 가능하도록 가드를 해제합니다.
      prefetchedProjectIdsRef.current.delete(projectId);
    });
  }, [projectId, queryClient]);
}
