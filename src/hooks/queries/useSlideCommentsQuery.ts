import { useInfiniteQuery } from '@tanstack/react-query';

import type { CommentWithUserDto, GetSlideCommentsResponseDto } from '@/api/dto';
import { getSlideComments } from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { DEMO_SLIDE_COMMENTS_BY_SLIDE_ID, isDemoSlideId } from '@/constants/demoProject';
import { useAuthStore } from '@/stores/authStore';
import type { Comment } from '@/types/comment';

const COMMENTS_PAGE_SIZE = 20;

function mapDemoCommentToDto(comment: Comment): CommentWithUserDto {
  const parentId = comment.parentId ?? null;
  const commentId = comment.serverId ?? comment.commentId;

  return {
    commentId,
    content: comment.content,
    user: {
      userId: comment.userId,
      nickName: comment.userName ?? '데모 사용자',
      profileImageUrl: comment.userProfileImage ?? null,
    },
    createdAt: comment.createdAt,
    updatedAt: comment.createdAt,
    parentId,
    parentCommentId: parentId,
  };
}

export function mapDtoToComment(dto: CommentWithUserDto, currentUserId?: string): Comment {
  const parentId = dto.parentId ?? dto.parentCommentId ?? undefined;

  return {
    commentId: dto.commentId,
    serverId: dto.commentId,
    userId: dto.user.userId,
    userName: dto.user.nickName,
    userProfileImage: dto.user.profileImageUrl ?? undefined,
    content: dto.content,
    createdAt: dto.createdAt,
    isMine: currentUserId ? dto.user.userId === currentUserId : false,
    parentId: parentId ?? undefined,
    isReply: Boolean(parentId),
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
  const isDemo = isDemoSlideId(slideId);

  return useInfiniteQuery({
    queryKey: queryKeys.comments.list(slideId ?? ''),
    queryFn: ({ pageParam }) => {
      if (isDemo) {
        const demoComments = (DEMO_SLIDE_COMMENTS_BY_SLIDE_ID[slideId ?? ''] ?? []).map(
          mapDemoCommentToDto,
        );

        return Promise.resolve({
          comments: demoComments,
          pagination: {
            page: typeof pageParam === 'number' ? pageParam : 1,
            limit: COMMENTS_PAGE_SIZE,
            total: demoComments.length,
            totalPages: 1,
          },
        } satisfies GetSlideCommentsResponseDto);
      }

      return getSlideComments(slideId!, pageParam, COMMENTS_PAGE_SIZE);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.map((page) => ({
        ...page,
        comments: page.comments.map((dto) => mapDtoToComment(dto, userId)),
      })),
      pageParams: data.pageParams,
    }),
    enabled: !!slideId,
  });
}
