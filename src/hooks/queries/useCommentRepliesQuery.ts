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
  const mapped = mapDtoToComment(dto, currentUserId);

  return {
    ...mapped,
    isReply: true,
    parentId: mapped.parentId ?? parentId,
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
    select: (data) => {
      const parentId = commentId!;
      const deduped = new Map<string, Comment>();

      for (const dto of data) {
        const reply = mapDtoToReply(dto, parentId, userId);

        // 일부 응답에서 부모 댓글이 섞여 내려오는 경우를 방어
        if (reply.commentId === parentId) continue;

        const key = reply.serverId || reply.commentId;
        if (!key) continue;
        if (!deduped.has(key)) {
          deduped.set(key, reply);
        }
      }

      return [...deduped.values()];
    },
    enabled: !!commentId && !shareToken,
  });
}
