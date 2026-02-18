import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateCommentRequestDto } from '@/api';
import type { CreateCommentResponseDto } from '@/api/dto';
import {
  createReply,
  createSlideComment,
  deleteComment as deleteCommentApi,
  updateComment as updateCommentApi,
} from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import { flatToTree } from '@/utils/comment';
import { showToast } from '@/utils/toast';
import { getUserDisplayName } from '@/utils/user';

// ── 내부 전용 TanStack Query 훅 ─────────────────────────────

function useCreateCommentMutation() {
  return useMutation({
    mutationFn: (variables: {
      slideId: string;
      projectId: string;
      data: CreateCommentRequestDto;
    }) => createSlideComment(variables.slideId, variables.data),
  });
}

function useCreateReplyMutation() {
  return useMutation({
    mutationFn: (variables: {
      commentId: string;
      slideId: string;
      projectId: string;
      data: { content: string };
    }) => createReply(variables.commentId, variables.data),
  });
}

function useUpdateCommentMutation() {
  return useMutation({
    mutationFn: (variables: {
      commentId: string;
      slideId: string;
      projectId: string;
      data: { content: string };
    }) => updateCommentApi(variables.commentId, variables.data),
  });
}

function useDeleteCommentMutation() {
  return useMutation({
    mutationFn: (variables: { commentId: string; slideId: string; projectId: string }) =>
      deleteCommentApi({ commentId: variables.commentId }),
  });
}

type CommentListCacheItem = {
  commentId?: string;
  parentId?: string | null;
  parentCommentId?: string | null;
};

type CommentListCachePage = {
  comments?: CommentListCacheItem[];
  pagination?: {
    total?: number;
  };
};

type CommentListInfiniteCache = {
  pages?: CommentListCachePage[];
  pageParams?: unknown[];
};

// ── 슬라이드 댓글 통합 훅 ───────────────────────────────────

const EMPTY_COMMENTS: Comment[] = [];

/**
 * 슬라이드 댓글 통합 훅
 *
 * API 호출 후 query invalidation으로 서버 데이터를 동기화합니다.
 * useSlideCommentsLoader가 서버 데이터를 store에 반영합니다.
 *
 * @returns comments - 트리 구조 댓글 목록 (최신순 정렬)
 * @returns addComment - 댓글 추가
 * @returns addReply - 답글 추가
 * @returns deleteComment - 댓글 삭제
 * @returns updateComment - 댓글 수정
 */
export function useSlideCommentsActions() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const slideId = useSlideStore((state) => state.slide?.slideId);
  const queryClient = useQueryClient();
  const flatComments = useSlideStore((state) => state.slide?.comments);
  const deleteCommentStore = useSlideStore((state) => state.deleteComment);
  const setComments = useSlideStore((state) => state.setComments);
  const updateCommentStore = useSlideStore((state) => state.updateComment);

  const { mutateAsync: createCommentMutateAsync } = useCreateCommentMutation();
  const { mutateAsync: createReplyMutateAsync } = useCreateReplyMutation();
  const { mutateAsync: deleteCommentMutateAsync } = useDeleteCommentMutation();
  const { mutateAsync: updateCommentMutateAsync } = useUpdateCommentMutation();

  const findComment = (commentId: string) => flatComments?.find((c) => c.commentId === commentId);

  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    const sorted = [...flatComments].sort((a, b) => {
      const aIndex =
        a.ref?.kind === 'slide' && typeof a.ref.index === 'number'
          ? a.ref.index
          : Number.MAX_SAFE_INTEGER;
      const bIndex =
        b.ref?.kind === 'slide' && typeof b.ref.index === 'number'
          ? b.ref.index
          : Number.MAX_SAFE_INTEGER;
      if (aIndex !== bIndex) return aIndex - bIndex;

      const at = Date.parse(a.createdAt);
      const bt = Date.parse(b.createdAt);
      if (Number.isNaN(at) || Number.isNaN(bt)) return 0;
      return at - bt; // 시간순(오래된 -> 최신)
    });
    return flatToTree(sorted);
  }, [flatComments]);

  const collectDeleteIds = (commentsSnapshot: Comment[], targetId: string) => {
    const deleteIds = new Set<string>([targetId]);
    let hasNewChild = true;

    while (hasNewChild) {
      hasNewChild = false;
      for (const comment of commentsSnapshot) {
        if (!comment.parentId) continue;
        if (deleteIds.has(comment.parentId) && !deleteIds.has(comment.commentId)) {
          deleteIds.add(comment.commentId);
          hasNewChild = true;
        }
      }
    }

    return deleteIds;
  };

  const removeFromRepliesCaches = (deleteIds: Set<string>) => {
    queryClient.setQueriesData(
      { queryKey: [...queryKeys.comments.all, 'replies'] },
      (oldData: unknown) => {
        if (!Array.isArray(oldData)) return oldData;

        return oldData.filter((item) => {
          if (!item || typeof item !== 'object') return true;
          const reply = item as CommentListCacheItem;
          if (reply.commentId && deleteIds.has(reply.commentId)) return false;
          if (reply.parentId && deleteIds.has(reply.parentId)) return false;
          if (reply.parentCommentId && deleteIds.has(reply.parentCommentId)) return false;
          return true;
        });
      },
    );
  };

  const removeFromCommentListCaches = (deleteIds: Set<string>) => {
    queryClient.setQueriesData({ queryKey: queryKeys.comments.lists() }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData;

      const infiniteCache = oldData as CommentListInfiniteCache;
      if (!Array.isArray(infiniteCache.pages)) return oldData;

      let hasChanged = false;

      const nextPages = infiniteCache.pages.map((page) => {
        if (!page || typeof page !== 'object' || !Array.isArray(page.comments)) return page;

        const prevLength = page.comments.length;
        const nextComments = page.comments.filter((comment) => {
          if (!comment || typeof comment !== 'object') return true;
          return !comment.commentId || !deleteIds.has(comment.commentId);
        });

        const removedCount = prevLength - nextComments.length;
        if (removedCount === 0) return page;

        hasChanged = true;
        const nextPage: CommentListCachePage = { ...page, comments: nextComments };
        if (page.pagination && typeof page.pagination.total === 'number') {
          nextPage.pagination = {
            ...page.pagination,
            total: Math.max(0, page.pagination.total - removedCount),
          };
        }
        return nextPage;
      });

      if (!hasChanged) return oldData;
      return {
        ...infiniteCache,
        pages: nextPages,
      };
    });
  };

  const snapshotQueryCaches = (queryKey: readonly unknown[]) =>
    queryClient.getQueriesData({
      queryKey,
    });

  const restoreQueryCaches = (snapshot: ReturnType<typeof queryClient.getQueriesData>) => {
    snapshot.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };

  const addComment = async (content: string): Promise<string | null> => {
    if (!slideId) return null;
    const trimmedContent = content.trim();
    if (!trimmedContent) return null;

    try {
      const response: CreateCommentResponseDto = await createCommentMutateAsync({
        slideId,
        projectId,
        data: { content: trimmedContent },
      });
      const currentUser = useAuthStore.getState().user;
      const latestComments = useSlideStore.getState().slide?.comments ?? [];
      const exists = latestComments.some(
        (comment) =>
          comment.serverId === response.commentId || comment.commentId === response.commentId,
      );

      if (!exists) {
        setComments([
          ...latestComments,
          {
            commentId: response.commentId,
            serverId: response.commentId,
            slideId,
            userId: currentUser?.id ?? response.userId,
            userName: getUserDisplayName(currentUser),
            userProfileImage: currentUser?.profileImage,
            content: trimmedContent,
            createdAt: response.createdAt,
            isMine: true,
            isReply: false,
          },
        ]);
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(slideId),
      });
      return response.commentId;
    } catch {
      showToast.error('댓글을 등록하지 못했습니다.', '잠시 후 다시 시도해주세요.');
      return null;
    }
  };

  const addReply = async (parentId: string, content: string) => {
    const target = findComment(parentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId ?? parentId;
    if (!targetSlideId) return;
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    try {
      const response = await createReplyMutateAsync({
        commentId: targetServerId,
        slideId: targetSlideId,
        projectId,
        data: { content: trimmedContent },
      });
      const currentUser = useAuthStore.getState().user;
      const latestComments = useSlideStore.getState().slide?.comments ?? [];
      const exists = latestComments.some(
        (comment) =>
          comment.serverId === response.replyId || comment.commentId === response.replyId,
      );

      if (!exists) {
        const localParent =
          latestComments.find(
            (comment) =>
              comment.commentId === parentId ||
              comment.serverId === targetServerId ||
              comment.commentId === targetServerId,
          ) ?? null;
        const resolvedParentId = localParent?.commentId ?? parentId;
        const parentIndex = latestComments.findIndex(
          (comment) => comment.commentId === resolvedParentId,
        );
        const newReply: Comment = {
          commentId: response.replyId,
          serverId: response.replyId,
          slideId: targetSlideId,
          userId: currentUser?.id ?? response.userId,
          userName: getUserDisplayName(currentUser),
          userProfileImage: currentUser?.profileImage,
          content: trimmedContent,
          createdAt: response.createdAt,
          isMine: true,
          parentId: resolvedParentId,
          isReply: true,
        };

        if (parentIndex === -1) {
          setComments([...latestComments, newReply]);
        } else {
          const next = [...latestComments];
          next.splice(parentIndex + 1, 0, newReply);
          setComments(next);
        }
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.replies(targetServerId),
      });
    } catch {
      showToast.error('답글을 등록하지 못했습니다.', '잠시 후 다시 시도해주세요.');
    }
  };

  const deleteComment = async (commentId: string) => {
    const target = findComment(commentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId ?? (target ? undefined : commentId);
    const previousComments = useSlideStore.getState().slide?.comments ?? [];
    const deleteIds = collectDeleteIds(previousComments, commentId);
    const previousListCaches = snapshotQueryCaches(queryKeys.comments.lists());
    const previousReplyCaches = snapshotQueryCaches([...queryKeys.comments.all, 'replies']);

    if (!targetSlideId) {
      showToast.error('댓글을 삭제하지 못했습니다.', '슬라이드 정보를 찾을 수 없습니다.');
      return;
    }

    // 낙관적 업데이트: UI에서 즉시 제거
    deleteCommentStore(commentId);
    removeFromCommentListCaches(deleteIds);
    removeFromRepliesCaches(deleteIds);

    // 서버에 저장되지 않은 댓글은 로컬에서만 삭제
    if (!targetServerId) {
      showToast.success('댓글을 삭제했습니다.');
      return;
    }

    try {
      await deleteCommentMutateAsync({
        commentId: targetServerId,
        slideId: targetSlideId,
        projectId,
      });
      // 즉시 재조회 시 서버 반영 지연으로 롤백처럼 보일 수 있어, 여기서는 캐시만 stale 처리
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.list(targetSlideId),
          refetchType: 'none',
        }),
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.comments.all, 'replies'],
          refetchType: 'none',
        }),
      ]);
      showToast.success('댓글을 삭제했습니다.');
    } catch {
      // 실패 시 롤백
      setComments(previousComments);
      restoreQueryCaches(previousListCaches);
      restoreQueryCaches(previousReplyCaches);
      showToast.error('댓글을 삭제하지 못했습니다.', '잠시 후 다시 시도해주세요.');
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    const target = findComment(commentId);
    const targetSlideId = target?.slideId ?? slideId;
    const targetServerId = target?.serverId;
    const previousComments = useSlideStore.getState().slide?.comments ?? [];

    if (!targetSlideId) {
      showToast.error('댓글을 수정하지 못했습니다.', '슬라이드 정보를 찾을 수 없습니다.');
      return;
    }

    // 서버에 저장되지 않은 댓글은 로컬에서만 수정
    if (!targetServerId) {
      updateCommentStore(commentId, content);
      return;
    }

    // 낙관적 업데이트: UI에서 즉시 반영
    updateCommentStore(commentId, content);

    try {
      await updateCommentMutateAsync({
        commentId: targetServerId,
        slideId: targetSlideId,
        projectId,
        data: { content },
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(targetSlideId),
      });
    } catch {
      // 실패 시 롤백
      setComments(previousComments);
      showToast.error('댓글을 수정하지 못했습니다.', '잠시 후 다시 시도해주세요.');
    }
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
    updateComment,
  };
}
