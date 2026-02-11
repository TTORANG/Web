import { useQuery } from '@tanstack/react-query';

import { getSharedComments } from '@/api/endpoints/shares';
import { queryKeys } from '@/api/queryClient';
import type { ReadSharedCommentsData } from '@/types/share';

type UseSharedCommentsOptions = {
  initialData?: ReadSharedCommentsData;
};

export function useSharedComments(
  shareToken: string,
  sessionId?: string,
  options: UseSharedCommentsOptions = {},
) {
  return useQuery({
    queryKey: queryKeys.shares.comments(shareToken, sessionId),
    queryFn: () => getSharedComments(shareToken, sessionId),
    enabled: !!shareToken,
    initialData: options.initialData,
  });
}
