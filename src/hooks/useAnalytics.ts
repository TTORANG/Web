import { useQuery } from '@tanstack/react-query';

import { getSlideAnalytics, getSummaryAnalytics } from '@/api/endpoints/analytics';
import { queryKeys } from '@/api/queryClient';

export function useSlideAnalytics(projectId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.slides(projectId),
    queryFn: () => getSlideAnalytics(projectId),
    enabled: !!projectId,
  });
}

export function useSummaryAnalytics(projectId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(projectId),
    queryFn: () => getSummaryAnalytics(projectId),
    enabled: !!projectId,
  });
}
