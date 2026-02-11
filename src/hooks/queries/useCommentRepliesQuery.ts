import { useParams } from 'react-router-dom';

import { useInfiniteQuery } from '@tanstack/react-query';

import { getReplies } from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore } from '@/stores/authStore';
import type { Comment } from '@/types/comment';

import { mapDtoToComment } from './useSlideCommentsQuery';

const REPLIES_PAGE_SIZE = 20;

type ReplyPageLike = {
  comments?: Parameters<typeof mapDtoToComment>[0][];
  pagination?: {
    page?: number;
    totalPages?: number;
  };
};

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
 * 댓글의 답글 목록 조회 (무한 스크롤)
 *
 * @param commentId - 부모 댓글의 서버 ID
 */
export function useCommentRepliesInfiniteQuery(commentId?: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const { shareToken } = useParams<{ shareToken?: string }>();

  return useInfiniteQuery({
    queryKey: queryKeys.comments.replies(commentId ?? ''),
    queryFn: ({ pageParam }) => getReplies(commentId!, pageParam, REPLIES_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageData = lastPage as ReplyPageLike;
      const page = pageData.pagination?.page;
      const totalPages = pageData.pagination?.totalPages;

      if (typeof page !== 'number' || typeof totalPages !== 'number') {
        return undefined;
      }
      return page < totalPages ? page + 1 : undefined;
    },
    select: (data) => ({
      replies: data.pages.flatMap((page) =>
        ((page as ReplyPageLike).comments ?? []).map((dto) =>
          mapDtoToReply(dto, commentId!, userId),
        ),
      ),
      pageParams: data.pageParams,
    }),
    enabled: !!commentId && !shareToken,
  });
}
