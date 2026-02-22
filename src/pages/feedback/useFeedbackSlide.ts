import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { slideView } from '@/api/endpoints/analytics';
import { createReply } from '@/api/endpoints/comments';
import { queryKeys } from '@/api/queryClient';
import { createDefaultReactions } from '@/constants/reaction';
import { useHotkey, useSlideComments } from '@/hooks';
import { useSharedComments } from '@/hooks/queries/useSharedComments';
import { useSlideCommentsActions } from '@/hooks/useSlideCommentsActions';
import { useSlideNavigation } from '@/hooks/useSlideNavigation';
import { useSlideReactions } from '@/hooks/useSlideReactions';
import { useAuthStore } from '@/stores/authStore';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import type {
  ReadSharedCommentsData,
  SharedPresentationComment,
  SharedPresentationSlide,
} from '@/types/share';
import { flatToTree } from '@/utils/comment';
import { normalizeSharedSlides } from '@/utils/sharedContent';
import { showToast } from '@/utils/toast';

import type { ShareExitSnapshot } from './useFeedbackVideo';

type UseFeedbackSlideOptions = {
  sharedSlides: SharedPresentationSlide[];
  sharedComments: SharedPresentationComment[];
  shareToken?: string;
  onShareExitSnapshotChange?: (snapshot: ShareExitSnapshot) => void;
};

/**
 * 공유 댓글을 Comment 타입으로 변환
 */
function mapSharedSlideComments(
  rawComments: SharedPresentationComment[],
  sharedSlideMeta: Map<string, { index: number; label: string }>,
): Comment[] {
  if (!rawComments.length) return [];

  return rawComments
    .filter((comment) => comment.targetType === 'slide')
    .map((comment) => {
      const meta = sharedSlideMeta.get(comment.targetId);
      return {
        commentId: comment.commentId,
        serverId: comment.commentId,
        slideId: comment.targetId,
        userId: comment.userId,
        userName: comment.writer,
        userProfileImage: comment.profileImageUrl ?? undefined,
        content: comment.content,
        createdAt: comment.createdAt,
        isMine: comment.isMine,
        parentId: comment.parentId ?? undefined,
        isReply: Boolean(comment.parentId),
        ref: meta ? ({ kind: 'slide' as const, index: meta.index } as const) : undefined,
        slideRef: meta?.label,
      };
    });
}

export const useFeedbackSlide = ({
  sharedSlides,
  sharedComments,
  shareToken,
  onShareExitSnapshotChange,
}: UseFeedbackSlideOptions) => {
  const queryClient = useQueryClient();
  const sessionId = useAuthStore((state) => state.user?.sessionId);
  const slides = useMemo(() => normalizeSharedSlides(sharedSlides), [sharedSlides]);

  const totalSlides = slides.length;
  const navigation = useSlideNavigation(totalSlides);
  const { slideIndex, goPrev, goNext, goToIndex } = navigation;

  const currentSlide = slides[slideIndex];

  const { reactions, addReaction } = useSlideReactions();

  const initSlide = useSlideStore((state) => state.initSlide);
  const setComments = useSlideStore((state) => state.setComments);
  const storedComments = useSlideComments();

  const [commentDraft, setCommentDraft] = useState('');
  const [scrollToCommentId, setScrollToCommentId] = useState<string | null>(null);

  useHotkey({ ArrowLeft: goPrev, ArrowRight: goNext }, { enabled: slides.length > 0 });

  // SharePage에 exit snapshot 보고
  const lastExitSnapshotSlideIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!onShareExitSnapshotChange) return;
    if (!shareToken) return;
    if (!currentSlide?.slideId) return;
    if (lastExitSnapshotSlideIdRef.current === currentSlide.slideId) return;

    const slideIdNum = Number(currentSlide.slideId);
    if (!Number.isFinite(slideIdNum)) return;

    lastExitSnapshotSlideIdRef.current = currentSlide.slideId;
    onShareExitSnapshotChange({ lastSlideId: slideIdNum });
  }, [onShareExitSnapshotChange, shareToken, currentSlide?.slideId]);

  // 슬라이드 전환 시 store 초기화
  const prevSlideIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentSlide) return;

    if (prevSlideIdRef.current !== currentSlide.slideId) {
      prevSlideIdRef.current = currentSlide.slideId;

      initSlide({
        ...currentSlide,
        emojiReactions: createDefaultReactions(),
        comments: storedComments,
      });
    }
  }, [currentSlide, initSlide, storedComments]);

  // 공유 댓글 정규화
  const sharedSlideMeta = useMemo(() => {
    return new Map(
      slides.map((slide, index) => [
        slide.slideId,
        { index, label: `Slide ${slide.slideNum ?? index + 1}` },
      ]),
    );
  }, [slides]);

  const { data: sharedCommentsData, isFetching: isCommentsLoading } = useSharedComments(
    encodeURIComponent(shareToken ?? ''),
    encodeURIComponent(sessionId ?? ''),
    {
      enabled: !!shareToken,
      initialData: {
        comments: sharedComments,
      },
      staleTime: 0,
    },
  );

  // 서버 댓글 목록을 store에 동기화
  useEffect(() => {
    if (!sharedCommentsData) return;
    const slideComments = mapSharedSlideComments(sharedCommentsData.comments, sharedSlideMeta);
    setComments(slideComments);
  }, [setComments, sharedCommentsData, sharedSlideMeta]);

  const invalidateSharedComments = useCallback(async (): Promise<ReadSharedCommentsData | null> => {
    if (!shareToken) return null;
    const sharedCommentsKey = queryKeys.shares.comments(shareToken, sessionId);

    await queryClient.invalidateQueries({
      queryKey: sharedCommentsKey,
    });

    return queryClient.getQueryData<ReadSharedCommentsData>(sharedCommentsKey) ?? null;
  }, [queryClient, sessionId, shareToken]);

  const { addComment, deleteComment, updateComment } = useSlideCommentsActions();

  // 최상위 부모 댓글 찾기 (반복문)
  const findRootParent = useCallback(
    (comment: Comment | undefined): Comment | undefined => {
      if (!comment) return undefined;

      let current = comment;
      while (current.parentId) {
        const parent = storedComments.find((c) => c.commentId === current.parentId);
        if (!parent) break;
        current = parent;
      }

      return current;
    },
    [storedComments],
  );

  const handleAddComment = async () => {
    if (!commentDraft.trim()) return;
    const serverId = await addComment(commentDraft);
    await invalidateSharedComments();
    if (serverId) {
      setScrollToCommentId(serverId);
    }
    setCommentDraft('');
  };

  const handleAddReply = async (parentId: string, content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    // 답글 대상 찾기
    const targetComment = storedComments.find((c) => c.commentId === parentId);
    if (!targetComment) {
      showToast.error('답글을 등록하지 못했습니다.', '원본 댓글을 찾을 수 없습니다.');
      return;
    }

    // 답글에 답글을 다는 경우, 최상위 부모를 찾음
    const rootParent = findRootParent(targetComment);
    const rootParentServerId = rootParent?.serverId || rootParent?.commentId;

    if (!rootParentServerId) {
      showToast.error('답글을 등록하지 못했습니다.', '댓글 정보를 확인해주세요.');
      return;
    }

    // 최상위 부모의 serverId로 답글 작성
    try {
      const response = await createReply(rootParentServerId, { content: trimmedContent });
      await invalidateSharedComments();

      // 작성한 답글로 스크롤
      if (response.replyId) {
        setScrollToCommentId(response.replyId);
      }
    } catch {
      showToast.error('답글을 등록하지 못했습니다.', '잠시 후 다시 시도해주세요.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    await invalidateSharedComments();
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    await updateComment(commentId, content);
    await invalidateSharedComments();
  };

  const handleGoToRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind !== 'slide') return;
      goToIndex(ref.index);
    },
    [goToIndex],
  );

  // 슬라이드 조회 analytics
  const lastSlideViewIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentSlide?.slideId) return;
    if (lastSlideViewIdRef.current === currentSlide.slideId) return;

    const slideIdNum = Number(currentSlide.slideId);
    if (!Number.isFinite(slideIdNum)) return;

    lastSlideViewIdRef.current = currentSlide.slideId;
    void slideView({ slideId: slideIdNum });
  }, [currentSlide?.slideId]);

  const script = currentSlide?.script ?? '';

  // flat 구조를 정렬 후 tree 구조로 변환
  const treeComments = useMemo(() => {
    // 정렬 로직
    const sorted = [...storedComments].sort((a, b) => {
      const isARoot = !a.parentId;
      const isBRoot = !b.parentId;

      // 둘 다 최상위 댓글인 경우
      if (isARoot && isBRoot) {
        // 1. 슬라이드 인덱스 오름차순
        const aIndex = a.ref?.kind === 'slide' ? a.ref.index : Number.MAX_SAFE_INTEGER;
        const bIndex = b.ref?.kind === 'slide' ? b.ref.index : Number.MAX_SAFE_INTEGER;
        if (aIndex !== bIndex) return aIndex - bIndex;

        // 2. 같은 슬라이드면 작성 시간 오름차순
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      // 둘 다 답글인 경우: 작성 시간 오름차순
      if (!isARoot && !isBRoot) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      // 하나는 최상위, 하나는 답글: 최상위를 먼저
      return isARoot ? -1 : 1;
    });

    return flatToTree(sorted);
  }, [storedComments]);

  return {
    state: {
      slides,
      currentSlide,
      totalSlides,
      slideIndex,
      script,
      comments: treeComments,
      commentDraft,
      scrollToCommentId,
      reactions,
      isLoading: false,
      isCommentsLoading,
      commentsHasNextPage: false,
      commentsIsFetchingNextPage: false,
      isFirst: navigation.isFirst,
      isLast: navigation.isLast,
    },
    actions: {
      goPrev,
      goNext,
      handleGoToRef,
      setCommentDraft,
      handleAddComment,
      addReply: handleAddReply,
      deleteComment: handleDeleteComment,
      updateComment: handleUpdateComment,
      addReaction,
      commentsFetchNextPage: async () => {},
    },
  };
};
