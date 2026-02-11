import { useQuery } from '@tanstack/react-query';

import type { CommentWithUserDto } from '@/api/dto';
import { getSlideComments } from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore } from '@/stores/authStore';
import type { Comment } from '@/types/comment';

function mapDtoToComment(dto: CommentWithUserDto, currentUserId?: string): Comment {
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
 * 슬라이드 댓글 목록 조회
 *
 * DTO를 Comment 타입으로 변환하고, 현재 사용자의 댓글을 isMine으로 표시합니다.
 *
 * @param slideId - 슬라이드 ID
 */
export function useSlideCommentsQuery(slideId?: string) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: queryKeys.comments.list(slideId ?? ''),
    queryFn: () => getSlideComments(slideId!, 1, 100),
    select: (data) => data.comments.map((dto) => mapDtoToComment(dto, userId)),
    enabled: !!slideId,
  });
}
