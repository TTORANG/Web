import { useQuery } from '@tanstack/react-query';

import { getSummaryAnalytics } from '@/api/endpoints/analytics';
import { queryKeys } from '@/api/queryClient';

export function useSummaryAnalytics(projectId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(projectId),
    queryFn: () => getSummaryAnalytics(projectId),
    enabled: !!projectId,
  });
}
