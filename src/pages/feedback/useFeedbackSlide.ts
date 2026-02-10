import { useCallback, useEffect, useRef, useState } from 'react';

import { pageView, slideView } from '@/api/endpoints/analytics';
import { createDefaultReactions } from '@/constants/reaction';
import { useHotkey, useSlideActions } from '@/hooks';
import { useScript } from '@/hooks/queries/useScript';
import { useSlides } from '@/hooks/queries/useSlides';
import { useExitTracker } from '@/hooks/useExitTracker';
import { useFeedbackWebSocket } from '@/hooks/useFeedbackWebSocket';
import { useSlideCommentsActions } from '@/hooks/useSlideCommentsActions';
import { useSlideCommentsLoader } from '@/hooks/useSlideCommentsLoader';
import { useSlideNavigation } from '@/hooks/useSlideNavigation';
import { useSlideReactions } from '@/hooks/useSlideReactions';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';

export const useFeedbackSlide = (projectId: string | undefined) => {
  const { data: slides, isLoading: isSlidesLoading } = useSlides(projectId ?? '');

  const webSocket = useFeedbackWebSocket({
    projectId: projectId ?? '',
    enabled: !!projectId,
  });

  const totalSlides = slides?.length ?? 0;
  const navigation = useSlideNavigation(totalSlides);
  const { slideIndex, goPrev, goNext, goToIndex } = navigation;

  const currentSlide = slides?.[slideIndex];

  const { comments, addComment, addReply, deleteComment, updateComment } =
    useSlideCommentsActions();
  const { reactions, toggleReaction } = useSlideReactions();

  const script = useSlideStore((state) => state.slide?.script ?? '');
  const initSlide = useSlideStore((state) => state.initSlide);
  const reactionHistory = useSlideStore((state) => state.reactionHistory);
  const reactionCounts = useSlideStore((state) => state.reactionCounts);

  const { updateScript } = useSlideActions();
  const { data: scriptData } = useScript(currentSlide?.slideId ?? '');

  const [commentDraft, setCommentDraft] = useState('');

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, slideIndex);
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

  useHotkey({ ArrowLeft: goPrev, ArrowRight: goNext }, { enabled: !isSlidesLoading });

  const buildExitPayload = useCallback(() => {
    if (!projectId) return null;
    const projectIdNum = Number(projectId);
    if (!Number.isFinite(projectIdNum)) return null;

    const payload: { projectId: number; lastSlideId?: number } = {
      projectId: projectIdNum,
    };

    if (currentSlide?.slideId) {
      const slideIdNum = Number(currentSlide.slideId);
      if (Number.isFinite(slideIdNum)) {
        payload.lastSlideId = slideIdNum;
      }
    }

    return payload;
  }, [projectId, currentSlide]);

  useExitTracker(buildExitPayload);

  const prevSlideIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentSlide) return;

    if (prevSlideIdRef.current !== currentSlide.slideId) {
      prevSlideIdRef.current = currentSlide.slideId;

      const mySavedReactions = reactionHistory[currentSlide.slideId] || [];
      const mySavedCounts = reactionCounts[currentSlide.slideId] || {};

      const initialReactions = createDefaultReactions().map((reaction) => ({
        ...reaction,
        active: mySavedReactions.includes(reaction.type),
        count: mySavedCounts[reaction.type] ?? reaction.count,
      }));

      initSlide({
        ...currentSlide,
        emojiReactions: initialReactions,
      });
      updateScript('');
    }
  }, [currentSlide, initSlide, updateScript, reactionHistory, reactionCounts]);

  const { isLoading: isCommentsLoading } = useSlideCommentsLoader(currentSlide?.slideId, {
    mapComments,
  });

  useEffect(() => {
    if (scriptData) {
      updateScript(scriptData.scriptText);
    }
  }, [scriptData, updateScript]);

  const handleGoToRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind !== 'slide') return;
      goToIndex(ref.index);
    },
    [goToIndex],
  );

  const pageViewSentRef = useRef(false);
  useEffect(() => {
    if (!projectId || pageViewSentRef.current) return;
    const projectIdNum = Number(projectId);
    if (!Number.isFinite(projectIdNum)) return;
    pageViewSentRef.current = true;
    void pageView({ projectId: projectIdNum });
  }, [projectId]);

  const lastSlideViewIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentSlide?.slideId) return;
    if (lastSlideViewIdRef.current === currentSlide.slideId) return;

    const slideIdNum = Number(currentSlide.slideId);
    if (!Number.isFinite(slideIdNum)) return;

    lastSlideViewIdRef.current = currentSlide.slideId;
    void slideView({ slideId: slideIdNum });
  }, [currentSlide?.slideId]);

  return {
    state: {
      slides,
      currentSlide,
      totalSlides,
      slideIndex,
      script,
      comments,
      commentDraft,
      reactions,
      isLoading: isSlidesLoading,
      isCommentsLoading,
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
      toggleReaction,
    },
    webSocket,
  };
};
