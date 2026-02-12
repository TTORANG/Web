import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { slideView } from '@/api/endpoints/analytics';
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
import { normalizeSharedSlides } from '@/utils/sharedContent';

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

  const { addComment, addReply, deleteComment, updateComment } = useSlideCommentsActions();

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
    await addReply(parentId, content);
    await reloadComments();
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

  return {
    state: {
      slides,
      currentSlide,
      totalSlides,
      slideIndex,
      script,
      comments: storedComments,
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
