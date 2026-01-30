/**
 * @file FeedbackVideoMobile.tsx
 * @description 비디오 피드백 페이지 - 모바일 뷰
 */
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import type { FeedbackVideoContext } from '@/hooks/useFeedbackVideo';

interface FeedbackVideoMobileProps {
  ctx: FeedbackVideoContext;
}

export default function FeedbackVideoMobile({ ctx }: FeedbackVideoMobileProps) {
  const {
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
    <FeedbackMobileLayout
      mediaSlot={
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={webcamVideoUrl}
          onTimeUpdate={updateCurrentTime}
          disablePip
          showLayoutToggle
        />
      }
      reactionSlot={
        <ReactionButtons
          reactions={reactions}
          onToggleReaction={toggleReaction}
          showLabel={false}
        />
      }
      scriptTabContent={
        <div className="px-4 py-4">
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
            onSeek={requestSeek}
          />
        </div>
      }
      commentTabContent={
        <>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
              onAddReply={addReply}
              onGoToRef={handleGoToTimeRef}
              onDeleteComment={deleteComment}
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
  );
}
