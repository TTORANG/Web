/**
 * 댓글 관련 TanStack Query 훅
 */
import { useQuery } from '@tanstack/react-query';

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

/** 슬라이드 댓글 목록 조회 */
export function useSlideCommentsQuery(slideId?: string) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery<GetSlideCommentsResponseDto, Error, Comment[]>({
    queryKey: queryKeys.comments.list(slideId ?? ''),
    queryFn: () => getSlideComments(slideId!),
    enabled: !!slideId,
    select: (data) => data.comments.map((dto) => mapDtoToComment(dto, userId)),
  });
}
