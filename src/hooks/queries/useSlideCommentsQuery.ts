import { useInfiniteQuery } from '@tanstack/react-query';

import type { CommentWithUserDto, GetSlideCommentsResponseDto } from '@/api/dto';
import { getSlideComments } from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore } from '@/stores/authStore';
import type { Comment } from '@/types/comment';

function mapDtoToComment(dto: CommentWithUserDto, currentUserId?: string): Comment {
  return {
    id: dto.commentId,
    serverId: dto.commentId,
    userId: dto.user.userId,
    content: dto.content,
    createdAt: dto.createdAt,
    isMine: currentUserId ? dto.user.userId === currentUserId : false,
  };
}

/**
 * 슬라이드 댓글 목록 조회 (무한 스크롤)
 *
 * DTO를 Comment 타입으로 변환하고, 현재 사용자의 댓글을 isMine으로 표시합니다.
 * pages를 flat한 Comment[]로 변환하여 제공합니다.
 *
 * @param slideId - 슬라이드 ID
 */
export function useSlideCommentsQuery(slideId?: string) {
  const userId = useAuthStore((state) => state.user?.id);

  return useInfiniteQuery<GetSlideCommentsResponseDto, Error, Comment[], string[], number>({
    queryKey: queryKeys.comments.list(slideId ?? ''),
    queryFn: ({ pageParam }) => getSlideComments(slideId!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    select: (data) =>
      data.pages.flatMap((p) => p.comments.map((dto) => mapDtoToComment(dto, userId))),
    enabled: !!slideId,
  });
}
