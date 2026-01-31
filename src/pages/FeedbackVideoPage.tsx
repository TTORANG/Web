/**
 * @file FeedbackVideoPage.tsx
 * @description 비디오 피드백 페이지
 *
 * 데스크톱과 모바일 뷰를 모두 포함하며, 반응형으로 UI를 렌더링합니다.
 */
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useFeedbackVideo } from '@/hooks/useFeedbackVideo';

export default function FeedbackVideoPage() {
  const ctx = useFeedbackVideo();
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
    <div className="flex h-full w-full">
      {/* 데스크톱 뷰 */}
      <div className="hidden md:flex flex-1 px-35">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
          <SlideWebcamStage
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            webcamVideoUrl={webcamVideoUrl}
            onTimeUpdate={updateCurrentTime}
          />
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

      {/* 모바일 뷰 */}
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
    </div>
  );
}
