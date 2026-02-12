import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { getReplies } from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore } from '@/stores/authStore';
import type { Comment } from '@/types/comment';

import { mapDtoToComment } from './useSlideCommentsQuery';

function mapDtoToReply(
  dto: Parameters<typeof mapDtoToComment>[0],
  parentId: string,
  currentUserId?: string,
): Comment {
  return {
    ...mapDtoToComment(dto, currentUserId),
    isReply: true,
    parentId,
  };
}

/**
 * 댓글의 답글 목록 조회
 *
 * @param commentId - 부모 댓글의 서버 ID
 */
export function useCommentRepliesQuery(commentId?: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const { shareToken } = useParams<{ shareToken?: string }>();

  return useQuery({
    queryKey: queryKeys.comments.replies(commentId ?? ''),
    queryFn: () => getReplies(commentId!),
    select: (data) => data.map((dto) => mapDtoToReply(dto, commentId!, userId)),
    enabled: !!commentId && !shareToken,
  });
}
