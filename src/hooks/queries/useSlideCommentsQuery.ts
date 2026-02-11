import { useInfiniteQuery } from '@tanstack/react-query';

import type { CommentWithUserDto } from '@/api/dto';
import { getSlideComments } from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore } from '@/stores/authStore';
import type { Comment } from '@/types/comment';

const COMMENTS_PAGE_SIZE = 20;

type SlideCommentsPageLike = {
  comments?: CommentWithUserDto[];
  pagination?: {
    page?: number;
    totalPages?: number;
  };
};

export function mapDtoToComment(dto: CommentWithUserDto, currentUserId?: string): Comment {
  return {
    commentId: dto.commentId,
    serverId: dto.commentId,
    userId: dto.user.userId,
    userName: dto.user.nickName,
    content: dto.content,
    createdAt: dto.createdAt,
    isMine: currentUserId ? dto.user.userId === currentUserId : false,
  };
}

/**
 * 슬라이드 댓글 목록 조회 (무한 스크롤)
 *
 * DTO를 Comment 타입으로 변환하고, 현재 사용자의 댓글을 isMine으로 표시합니다.
 *
 * @param slideId - 슬라이드 ID
 */
export function useSlideCommentsInfiniteQuery(slideId?: string) {
  const userId = useAuthStore((state) => state.user?.id);

  return useInfiniteQuery({
    queryKey: queryKeys.comments.list(slideId ?? ''),
    queryFn: ({ pageParam }) => getSlideComments(slideId!, pageParam, COMMENTS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = (lastPage as SlideCommentsPageLike).pagination?.page;
      const totalPages = (lastPage as SlideCommentsPageLike).pagination?.totalPages;

      if (typeof page !== 'number' || typeof totalPages !== 'number') {
        return undefined;
      }
      return page < totalPages ? page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.map((page) => ({
        ...page,
        comments: ((page as SlideCommentsPageLike).comments ?? []).map((dto) =>
          mapDtoToComment(dto, userId),
        ),
      })),
      pageParams: data.pageParams,
    }),
    enabled: !!slideId,
  });
}
