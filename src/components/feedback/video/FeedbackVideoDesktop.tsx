/**
 * @file FeedbackVideoDesktop.tsx
 * @description 비디오 피드백 페이지 - 데스크톱 뷰
 */
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import type { FeedbackVideoContext } from '@/hooks/useFeedbackVideo';

interface FeedbackVideoDesktopProps {
  ctx: FeedbackVideoContext;
}

export default function FeedbackVideoDesktop({ ctx }: FeedbackVideoDesktopProps) {
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
    toggleReaction,
  } = ctx;

  return (
    <div className="flex flex-1 px-35">
      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
        {/* 슬라이드 + 웹캠 + 재생바 (오버레이) */}
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={webcamVideoUrl}
          onTimeUpdate={updateCurrentTime}
        />

        {/* 대본 섹션 */}
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
  );
}
