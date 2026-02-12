import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { slideView } from '@/api/endpoints/analytics';
import { createReply } from '@/api/endpoints/comments';
import { getSharedComments } from '@/api/endpoints/shares';
import { createDefaultReactions } from '@/constants/reaction';
import { useHotkey, useSlideComments } from '@/hooks';
import { useSlideCommentsActions } from '@/hooks/useSlideCommentsActions';
import { useSlideNavigation } from '@/hooks/useSlideNavigation';
import { useSlideReactions } from '@/hooks/useSlideReactions';
import { useAuthStore } from '@/stores/authStore';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import type { SharedProjectComment, SharedProjectSlide } from '@/types/share';
import { flatToTree } from '@/utils/comment';
import { normalizeSharedSlides } from '@/utils/sharedContent';
import { showToast } from '@/utils/toast';

import type { ShareExitSnapshot } from './useFeedbackVideo';

type UseFeedbackSlideOptions = {
  sharedSlides: SharedProjectSlide[];
  sharedComments: SharedProjectComment[];
  shareToken?: string;
  onShareExitSnapshotChange?: (snapshot: ShareExitSnapshot) => void;
};

/**
 * 공유 댓글을 Comment 타입으로 변환
 */
function mapSharedSlideComments(
  rawComments: SharedProjectComment[],
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

  // 서버에서 최신 댓글 목록을 가져와서 store 업데이트
  const reloadComments = useCallback(async () => {
    if (!shareToken) return null;

    try {
      const { user } = useAuthStore.getState();
      const sessionId = user?.sessionId;
      const data = await getSharedComments(shareToken, sessionId);
      const slideComments = mapSharedSlideComments(data.comments, sharedSlideMeta);
      setComments(slideComments);
      return data.comments;
    } catch {
      return null;
    }
  }, [shareToken, setComments, sharedSlideMeta]);

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
    await reloadComments();
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
      await reloadComments();

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
    await reloadComments();
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    await updateComment(commentId, content);
    await reloadComments();
  };

  // 초기 댓글 로딩
  useEffect(() => {
    const initialComments = mapSharedSlideComments(sharedComments, sharedSlideMeta);
    if (initialComments.length > 0) {
      setComments(initialComments);
    }
  }, [sharedComments, sharedSlideMeta, setComments]);

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
      // 최상위 댓글 (parentId 없음)만 슬라이드 인덱스 기준 정렬
      const isARoot = !a.parentId;
      const isBRoot = !b.parentId;

      if (isARoot && isBRoot) {
        // 둘 다 최상위 댓글: 슬라이드 인덱스 오름차순
        const aIndex = a.ref?.kind === 'slide' ? a.ref.index : Number.MAX_SAFE_INTEGER;
        const bIndex = b.ref?.kind === 'slide' ? b.ref.index : Number.MAX_SAFE_INTEGER;
        if (aIndex !== bIndex) return aIndex - bIndex;
      }

      // 답글이거나 같은 슬라이드인 경우: 작성 시간 오름차순 (오래된 것 → 최신)
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
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
      isCommentsLoading: false,
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
