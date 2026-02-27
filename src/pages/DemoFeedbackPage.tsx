import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { DEMO_PRESENTATION } from '@/constants/demoPresentation';
import { createDefaultReactions } from '@/constants/reaction';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import type { Reaction, ReactionType } from '@/types/script';
import { countTreeComments, deleteFromFlat, flatToTree, updateInFlat } from '@/utils/comment';

function createDemoCommentId() {
  return `demo-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function DemoFeedbackPage() {
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const currentTime = useVideoFeedbackStore((state) => state.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((state) => state.updateCurrentTime);
  const requestSeek = useVideoFeedbackStore((state) => state.requestSeek);
  const clearSeek = useVideoFeedbackStore((state) => state.clearSeek);

  const [commentDraft, setCommentDraft] = useState('');
  const [capturedTimestamp, setCapturedTimestamp] = useState<number | null>(null);
  const [scrollToCommentId, setScrollToCommentId] = useState<string | undefined>(undefined);
  const [commentsFlat, setCommentsFlat] = useState<Comment[]>(DEMO_PRESENTATION.initialComments);

  const [reactions, setReactions] = useState<Reaction[]>(() => {
    const defaults = createDefaultReactions();
    const countMap = new Map(
      DEMO_PRESENTATION.initialReactions.map((reaction) => [reaction.type, reaction.count]),
    );

    return defaults.map((reaction) => ({
      ...reaction,
      count: countMap.get(reaction.type) ?? reaction.count,
      active: false,
    }));
  });

  const reactionActiveTimersRef = useRef<
    Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>
  >({});

  // 비디오 위치 계산을 위한 refs
  const desktopPlaceholderRef = useRef<HTMLDivElement>(null);
  const mobilePlaceholderRef = useRef<HTMLDivElement>(null);
  const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
  });

  const projectSlides = DEMO_PRESENTATION.slides;
  const slideChangeTimes = useMemo(
    () => projectSlides.map((slide, index) => slide.startTime ?? index * 30),
    [projectSlides],
  );

  const comments = useMemo(() => {
    const sorted = [...commentsFlat].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return flatToTree(sorted);
  }, [commentsFlat]);

  useEffect(() => {
    updateCurrentTime(0);
    clearSeek();
  }, [clearSeek, updateCurrentTime]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawSeek = params.get('t');
    if (!rawSeek) return;

    const seekSeconds = Number(rawSeek);
    if (!Number.isFinite(seekSeconds) || seekSeconds < 0) return;

    requestSeek(seekSeconds);
  }, [location.search, requestSeek]);

  useEffect(() => {
    const timerMap = reactionActiveTimersRef.current;
    return () => {
      Object.values(timerMap).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  // 비디오 위치 업데이트
  useEffect(() => {
    const updateVideoPosition = () => {
      const primaryRef = isDesktop ? desktopPlaceholderRef : mobilePlaceholderRef;
      const fallbackRef = isDesktop ? mobilePlaceholderRef : desktopPlaceholderRef;

      let rect = primaryRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        rect = fallbackRef.current?.getBoundingClientRect();
      }

      if (!rect || rect.width === 0 || rect.height === 0) return;

      setVideoStyle({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 20,
        opacity: 1,
      });
    };

    const timers = [0, 50, 100, 200].map((delay) => setTimeout(updateVideoPosition, delay));
    const observer = new ResizeObserver(updateVideoPosition);

    if (desktopPlaceholderRef.current) observer.observe(desktopPlaceholderRef.current);
    if (mobilePlaceholderRef.current) observer.observe(mobilePlaceholderRef.current);

    window.addEventListener('resize', updateVideoPosition);
    window.addEventListener('scroll', updateVideoPosition, true);

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', updateVideoPosition);
      window.removeEventListener('scroll', updateVideoPosition, true);
    };
  }, [isDesktop]);

  const handleInputFocus = () => {
    if (capturedTimestamp === null) {
      setCapturedTimestamp(currentTime);
    }
  };

  const handleAddComment = () => {
    const trimmed = commentDraft.trim();
    if (!trimmed) return;

    const seconds = capturedTimestamp ?? currentTime;
    const nextId = createDemoCommentId();

    const nextComment: Comment = {
      commentId: nextId,
      userId: 'demo-me',
      userName: '나',
      content: trimmed,
      createdAt: new Date().toISOString(),
      isMine: true,
      ref: { kind: 'video', seconds: Math.max(0, seconds) },
    };

    setCommentsFlat((prev) => [...prev, nextComment]);
    setCommentDraft('');
    setCapturedTimestamp(null);
    setScrollToCommentId(nextId);
    setTimeout(() => setScrollToCommentId(undefined), 500);
  };

  const handleCancelComment = () => {
    setCommentDraft('');
    setCapturedTimestamp(null);
  };

  const handleAddReply = (parentId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const nextReply: Comment = {
      commentId: createDemoCommentId(),
      parentId,
      isReply: true,
      userId: 'demo-me',
      userName: '나',
      content: trimmed,
      createdAt: new Date().toISOString(),
      isMine: true,
    };

    setCommentsFlat((prev) => [...prev, nextReply]);
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentsFlat((prev) => deleteFromFlat(prev, commentId));
  };

  const handleUpdateComment = (commentId: string, content: string) => {
    setCommentsFlat((prev) => updateInFlat(prev, commentId, content));
  };

  const handleGoToRef = (ref: NonNullable<Comment['ref']>) => {
    if (ref.kind === 'video') {
      requestSeek(ref.seconds);
      return;
    }

    requestSeek(slideChangeTimes[ref.index] ?? 0);
  };

  const handleAddReaction = (type: ReactionType) => {
    setReactions((prev) =>
      prev.map((reaction) =>
        reaction.type === type
          ? { ...reaction, count: reaction.count + 1, active: true }
          : { ...reaction, active: false },
      ),
    );

    const existing = reactionActiveTimersRef.current[type];
    if (existing) {
      clearTimeout(existing);
    }

    reactionActiveTimersRef.current[type] = setTimeout(() => {
      setReactions((prev) =>
        prev.map((reaction) =>
          reaction.type === type ? { ...reaction, active: false } : reaction,
        ),
      );
    }, 500);
  };

  return (
    <div className="flex h-full w-full min-w-0">
      {/* 데스크톱 뷰 */}
      <div className="hidden md:flex flex-1 px-35">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div ref={desktopPlaceholderRef} className="w-full aspect-video" />
          </div>
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
            onSeek={requestSeek}
            isLoading={false}
            variant="inverted"
          />
        </div>

        <aside className="w-96 shrink-0 bg-gray-100 flex flex-col border-l border-gray-200">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
              scrollToCommentId={scrollToCommentId}
              onAddReply={handleAddReply}
              onGoToRef={handleGoToRef}
              onDeleteComment={handleDeleteComment}
              onUpdateComment={handleUpdateComment}
              isLoading={false}
            />
          </div>

          <div className="shrink-0 border-t border-black/5 flex flex-col gap-6 px-4 pb-6 pt-2">
            <CommentInput
              value={commentDraft}
              onChange={setCommentDraft}
              onSubmit={handleAddComment}
              onCancel={handleCancelComment}
              onFocusCapture={handleInputFocus}
              className="items-end w-86"
            />
            <ReactionButtons
              reactions={reactions}
              onToggleReaction={handleAddReaction}
              layout="grid-2"
            />
          </div>
        </aside>
      </div>

      {/* 모바일 뷰 */}
      <FeedbackMobileLayout
        mediaSlot={<div ref={mobilePlaceholderRef} className="w-full min-w-0 aspect-video" />}
        reactionSlot={
          <ReactionButtons
            reactions={reactions}
            onToggleReaction={handleAddReaction}
            showLabel={false}
          />
        }
        scriptTabContent={
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
            onSeek={requestSeek}
            variant="inverted"
          />
        }
        commentTabContent={
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CommentList
                comments={comments}
                scrollToCommentId={scrollToCommentId}
                onAddReply={handleAddReply}
                onGoToRef={handleGoToRef}
                onDeleteComment={handleDeleteComment}
                onUpdateComment={handleUpdateComment}
              />
            </div>
            <div className="shrink-0 px-4 py-3">
              <CommentInput
                value={commentDraft}
                onChange={setCommentDraft}
                onSubmit={handleAddComment}
                onCancel={handleCancelComment}
                onFocusCapture={handleInputFocus}
                className="w-full"
              />
            </div>
          </>
        }
        commentCount={countTreeComments(comments)}
      />

      {/* 단일 Stage (로컬 상태 전용) */}
      <div style={videoStyle}>
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={DEMO_PRESENTATION.videoUrl}
          isDataLoading={false}
          dataErrorMessage={null}
          onTimeUpdate={updateCurrentTime}
          disablePip={!isDesktop}
          showLayoutToggle={!isDesktop}
        />
      </div>
    </div>
  );
}
