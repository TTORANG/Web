import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { slideView } from '@/api/endpoints/analytics';
import { createDefaultReactions } from '@/constants/reaction';
import { useHotkey, useSlideComments } from '@/hooks';
import { useSlideCommentsActions } from '@/hooks/useSlideCommentsActions';
import { useSlideCommentsLoader } from '@/hooks/useSlideCommentsLoader';
import { useSlideNavigation } from '@/hooks/useSlideNavigation';
import { useSlideReactions } from '@/hooks/useSlideReactions';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import type { SharedProjectComment, SharedProjectSlide } from '@/types/share';
import type { SlideDetail } from '@/types/slide';

import type { ShareExitSnapshot } from './useFeedbackVideo';

const SHARED_PROJECT_ID = 'shared';

function toNumber(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeSharedSlides(rawSlides: SharedProjectSlide[]): SlideDetail[] {
  const now = new Date().toISOString();

  return rawSlides
    .map((slide, index) => {
      const slideNum = toNumber(slide.slideNum, index + 1);
      return {
        slideId: slide.slideId,
        projectId: SHARED_PROJECT_ID,
        title: slide.title ?? '슬라이드 ' + slideNum,
        slideNum,
        imageUrl: slide.imageUrl,
        createdAt: now,
        updatedAt: now,
        script: slide.scriptText ?? '',
      };
    })
    .sort((a, b) => a.slideNum - b.slideNum);
}

type UseFeedbackSlideOptions = {
  sharedSlides: SharedProjectSlide[];
  sharedComments: SharedProjectComment[];
  shareToken?: string;
  onShareExitSnapshotChange?: (snapshot: ShareExitSnapshot) => void;
};

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

  const { comments, addComment, addReply, deleteComment, updateComment } =
    useSlideCommentsActions();
  const { reactions, addReaction } = useSlideReactions();

  const initSlide = useSlideStore((state) => state.initSlide);
  const setComments = useSlideStore((state) => state.setComments);
  const storedComments = useSlideComments();

  const [commentDraft, setCommentDraft] = useState('');
  const [scrollToCommentId, setScrollToCommentId] = useState<string | null>(null);

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    const newComment = addComment(commentDraft, slideIndex);
    if (newComment?.commentId) {
      setScrollToCommentId(newComment.commentId);
    }
    setCommentDraft('');
  };

  const mapComments = useCallback(
    (items: Comment[]) => {
      if (!currentSlide) return items;
      const slideLabel = `Slide ${slideIndex + 1}`;
      return items.map((comment) => ({
        ...comment,
        slideId: currentSlide.slideId,
        ref: { kind: 'slide' as const, index: slideIndex },
        slideRef: slideLabel,
      }));
    },
    [currentSlide, slideIndex],
  );

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

  const sharedSlideComments = useMemo(() => {
    return sharedComments
      .filter((comment) => comment.targetType === 'slide')
      .map((comment) => {
        const meta = sharedSlideMeta.get(comment.targetId);
        return {
          commentId: comment.commentId,
          serverId: comment.commentId,
          slideId: comment.targetId,
          userId: comment.writer,
          content: comment.content,
          createdAt: comment.createdAt,
          isMine: false,
          parentId: comment.parentId ?? undefined,
          isReply: Boolean(comment.parentId),
          ref: meta ? ({ kind: 'slide' as const, index: meta.index } as const) : undefined,
          slideRef: meta?.label,
        };
      });
  }, [sharedComments, sharedSlideMeta]);

  // 공유 댓글과 로컬 댓글 병합
  useEffect(() => {
    if (sharedSlideComments.length === 0 && storedComments.length === 0) return;

    const sharedServerIds = new Set(
      sharedSlideComments
        .map((comment) => comment.serverId ?? comment.commentId)
        .filter((id): id is string => Boolean(id)),
    );
    const localOnlyComments = storedComments.filter((comment) => {
      if (!comment.serverId) return true;
      return !sharedServerIds.has(comment.serverId);
    });
    const mergedComments = [...localOnlyComments, ...sharedSlideComments];
    const isSameLength = storedComments.length === mergedComments.length;
    const isSameOrderAndIdentity =
      isSameLength && storedComments.every((comment, index) => comment === mergedComments[index]);

    if (isSameOrderAndIdentity) return;
    setComments(mergedComments);
  }, [sharedSlideComments, setComments, storedComments]);

  const {
    isLoading: isCommentsLoading,
    hasNextPage: commentsHasNextPage,
    isFetchingNextPage: commentsIsFetchingNextPage,
    fetchNextPage: commentsFetchNextPage,
  } = useSlideCommentsLoader(currentSlide?.slideId, {
    mapComments,
    enabled: false,
    resetOnSlideChange: false,
  });

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
      comments,
      commentDraft,
      scrollToCommentId,
      reactions,
      isLoading: false,
      isCommentsLoading,
      commentsHasNextPage,
      commentsIsFetchingNextPage,
      isFirst: navigation.isFirst,
      isLast: navigation.isLast,
    },
    actions: {
      goPrev,
      goNext,
      handleGoToRef,
      setCommentDraft,
      handleAddComment,
      addReply,
      deleteComment,
      updateComment,
      addReaction,
      commentsFetchNextPage,
    },
  };
};
