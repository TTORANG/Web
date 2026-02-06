/**
 * @file FeedbackVideoPage.tsx
 * @description 비디오 피드백 페이지
 *
 * 데스크톱과 모바일 뷰를 모두 포함하며, 반응형으로 UI를 렌더링합니다.
 * CSS-only 방식으로 단일 비디오 요소의 위치를 조정하여 심리스한 전환을 지원합니다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import WebSocketDebug from '@/components/common/WebSocketDebug';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useExitTracker } from '@/hooks/useExitTracker';
import { useFeedbackVideo } from '@/hooks/useFeedbackVideo';
import { useFeedbackWebSocket } from '@/hooks/useFeedbackWebSocket';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';

export default function FeedbackVideoPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const isDesktop = useIsDesktop();
  const ctx = useFeedbackVideo();
  const videoId = useVideoFeedbackStore((s) => s.video?.videoId);
  const {
    isLoading,
    currentTime,
    projectSlides,
    slideChangeTimes,
    comments,
    reactions,
    commentDraft,
    timestampPrefix,
    webcamVideoUrl,
    updateCurrentTime,
    requestSeek,
    setCommentDraft,
    handleAddComment,
    handleGoToTimeRef,
    addReply,
    deleteComment,
    updateComment,
    toggleReaction,
  } = ctx;

  const buildExitPayload = useCallback(() => {
    if (!projectId) return null;
    const projectIdNum = Number(projectId);
    if (!Number.isFinite(projectIdNum)) return null;

    const payload: {
      projectId: number;
      lastVideoId?: number;
      lastVideoTimeMs?: number;
    } = {
      projectId: projectIdNum,
    };

    if (videoId) {
      const videoIdNum = Number(videoId);
      if (Number.isFinite(videoIdNum)) {
        payload.lastVideoId = videoIdNum;
      }
    }

    payload.lastVideoTimeMs = Math.max(0, Math.round(currentTime * 1000));

    return payload;
  }, [projectId, videoId, currentTime]);

  useExitTracker(buildExitPayload);

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

  // 웹소켓 연결
  const { isConnected, currentRooms, joinProject, leaveProject, getRooms } = useFeedbackWebSocket({
    projectId: projectId ?? '',
    enabled: !!projectId,
  });

  return (
    <div className="flex h-full w-full">
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
          />
        </div>

        <aside className="w-96 shrink-0 bg-gray-100 flex flex-col border-l border-gray-200">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
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
              onCancel={() => setCommentDraft('')}
              className="items-end w-86"
              initialValueOnFocus={timestampPrefix}
            />
            <ReactionButtons
              reactions={reactions}
              onToggleReaction={toggleReaction}
              layout="grid-2"
            />
          </div>
        </aside>
      </div>

      {/* 모바일 뷰 */}
      <FeedbackMobileLayout
        mediaSlot={<div ref={mobilePlaceholderRef} className="w-full aspect-video" />}
        reactionSlot={
          <ReactionButtons
            reactions={reactions}
            onToggleReaction={toggleReaction}
            showLabel={false}
          />
        }
        scriptTabContent={
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
            onSeek={requestSeek}
          />
        }
        commentTabContent={
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CommentList
                comments={comments}
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
                onCancel={() => setCommentDraft('')}
                className="w-full"
                initialValueOnFocus={timestampPrefix}
              />
            </div>
          </>
        }
        commentCount={comments.length}
      />

      {/* 단일 SlideWebcamStage - CSS로 위치 조정 */}
      <div style={videoStyle}>
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={webcamVideoUrl}
          onTimeUpdate={updateCurrentTime}
          disablePip={!isDesktop}
          showLayoutToggle={!isDesktop}
        />
      </div>

      {/* WebSocket 디버그 UI (개발 환경에서만) */}
      <WebSocketDebug
        isConnected={isConnected}
        currentRooms={currentRooms}
        projectId={projectId}
        onJoinProject={joinProject}
        onLeaveProject={leaveProject}
        onGetRooms={getRooms}
      />
    </div>
  );
}
