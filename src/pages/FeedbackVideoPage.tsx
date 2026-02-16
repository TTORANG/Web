/**
 * @file FeedbackVideoPage.tsx
 * @description 비디오 피드백 페이지
 *
 * 데스크톱과 모바일 뷰를 모두 포함하며, 반응형으로 UI를 렌더링합니다.
 * CSS-only 방식으로 단일 비디오 요소의 위치를 조정하여 심리스한 전환을 지원합니다.
 */
import { useEffect, useRef, useState } from 'react';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { type ShareExitSnapshot, useFeedbackVideo } from '@/pages/feedback/useFeedbackVideo';
import type { ReadSharedContentData } from '@/types/share';
import { countTreeComments } from '@/utils/comment';

interface FeedbackVideoPageProps {
  sharedContent: ReadSharedContentData;
  onShareExitSnapshotChange: (snapshot: ShareExitSnapshot) => void;
}

export default function FeedbackVideoPage({
  sharedContent,
  onShareExitSnapshotChange,
}: FeedbackVideoPageProps) {
  const isDesktop = useIsDesktop();
  const ctx = useFeedbackVideo(sharedContent, { onShareExitSnapshotChange });

  const {
    isLoading,
    currentTime,
    projectSlides,
    slideChangeTimes,
    comments,
    reactions,
    commentDraft,
    scrollToCommentId,
    isSubmittingComment,
    webcamVideoUrl,
    updateCurrentTime,
    requestSeek,
    setCommentDraft,
    handleInputFocus,
    handleAddComment,
    handleCancelComment,
    handleGoToTimeRef,
    handleVideoPlaybackEvent,
    addReply,
    deleteComment,
    updateComment,
    addReaction,
  } = ctx;

  // 비디오 위치 계산을 위한 refs
  const desktopPlaceholderRef = useRef<HTMLDivElement>(null);
  const mobilePlaceholderRef = useRef<HTMLDivElement>(null);
  const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0, // 위치 계산 전까지 숨김
  });

  // 비디오 위치 업데이트
  useEffect(() => {
    const updateVideoPosition = () => {
      // 현재 viewport에 맞는 placeholder 우선 사용
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

    // 레이아웃 안정화 후 위치 계산
    const timers = [0, 50, 100, 200].map((delay) => setTimeout(updateVideoPosition, delay));

    // 두 placeholder 모두 관찰
    const observer = new ResizeObserver(updateVideoPosition);
    if (desktopPlaceholderRef.current) observer.observe(desktopPlaceholderRef.current);
    if (mobilePlaceholderRef.current) observer.observe(mobilePlaceholderRef.current);

    // 리사이즈, 스크롤 이벤트 리스너
    window.addEventListener('resize', updateVideoPosition);
    window.addEventListener('scroll', updateVideoPosition, true);

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', updateVideoPosition);
      window.removeEventListener('scroll', updateVideoPosition, true);
    };
  }, [isDesktop]);

  return (
    <div className="flex h-full w-full min-w-0">
      {/* 데스크톱 뷰 */}
      <div className="hidden md:flex flex-1 px-35">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
          {/* 비디오 위치 placeholder */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div ref={desktopPlaceholderRef} className="w-full aspect-video" />
          </div>
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
            onSeek={requestSeek}
            isLoading={isLoading}
            variant="inverted"
          />
        </div>

        <aside className="w-96 shrink-0 bg-gray-100 flex flex-col border-l border-gray-200">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
              scrollToCommentId={scrollToCommentId}
              onAddReply={addReply}
              onGoToRef={handleGoToTimeRef}
              onDeleteComment={deleteComment}
              onUpdateComment={updateComment}
              isLoading={isLoading}
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
              disabled={isSubmittingComment}
            />
            <ReactionButtons reactions={reactions} onToggleReaction={addReaction} layout="grid-2" />
          </div>
        </aside>
      </div>

      {/* 모바일 뷰 */}
      <FeedbackMobileLayout
        mediaSlot={<div ref={mobilePlaceholderRef} className="w-full min-w-0 aspect-video" />}
        reactionSlot={
          <ReactionButtons reactions={reactions} onToggleReaction={addReaction} showLabel={false} />
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
                onAddReply={addReply}
                onGoToRef={handleGoToTimeRef}
                onDeleteComment={deleteComment}
                onUpdateComment={updateComment}
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
                disabled={isSubmittingComment}
              />
            </div>
          </>
        }
        commentCount={countTreeComments(comments)}
      />

      {/* 단일 SlideWebcamStage - CSS로 위치 조정 */}
      <div style={videoStyle}>
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={webcamVideoUrl}
          onTimeUpdate={updateCurrentTime}
          onVideoEvent={handleVideoPlaybackEvent}
          disablePip={!isDesktop}
          showLayoutToggle={!isDesktop}
        />
      </div>
    </div>
  );
}
