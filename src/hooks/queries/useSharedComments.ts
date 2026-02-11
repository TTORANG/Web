import { useQuery } from '@tanstack/react-query';

import { getSharedComments } from '@/api/endpoints/shares';
import { queryKeys } from '@/api/queryClient';
import type { ReadSharedCommentsData } from '@/types/share';

type UseSharedCommentsOptions = {
  initialData?: ReadSharedCommentsData;
};

export function useSharedComments(shareToken: string, options: UseSharedCommentsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.shares.comments(shareToken),
    queryFn: () => getSharedComments(shareToken),
    enabled: !!shareToken,
    initialData: options.initialData,
  });
}
