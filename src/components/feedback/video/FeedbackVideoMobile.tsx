/**
 * @file FeedbackVideoMobile.tsx
 * @description 비디오 피드백 페이지 - 모바일 뷰
 */
import { type KeyboardEvent, useCallback, useState } from 'react';

import clsx from 'clsx';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import type { FeedbackVideoContext } from '@/hooks/useFeedbackVideo';

interface FeedbackVideoMobileProps {
  ctx: FeedbackVideoContext;
}

const TAB_IDS = {
  script: 'feedback-video-tab-script',
  comment: 'feedback-video-tab-comment',
} as const;

const PANEL_IDS = {
  script: 'feedback-video-panel-script',
  comment: 'feedback-video-panel-comment',
} as const;

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

  const [mobileTab, setMobileTab] = useState<'script' | 'comment'>('script');

  const handleTabKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setMobileTab((prev) => {
      if (prev === 'script') return event.key === 'ArrowRight' ? 'comment' : 'script';
      return event.key === 'ArrowLeft' ? 'script' : 'comment';
    });
  }, []);

  const getTabClassName = (isActive: boolean) =>
    clsx(
      'flex-1 py-3 max-[350px]:py-2 text-body-m-bold max-[350px]:text-body-s transition-colors',
      isActive ? 'text-main border-b-2 border-main-variant1' : 'text-gray-600',
    );

  return (
    <div className="flex flex-1 flex-col bg-gray-100 min-w-0">
      <div className="pt-4 max-[350px]:pb-3">
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={webcamVideoUrl}
          onTimeUpdate={updateCurrentTime}
          disablePip
          showLayoutToggle
        />
      </div>

      <div className="shrink-0 px-4 pb-3 pt-5 flex flex-col gap-2 max-[350px]:px-3 max-[350px]:pb-2 max-[350px]:pt-1">
        <ReactionButtons
          reactions={reactions}
          onToggleReaction={toggleReaction}
          showLabel={false}
          className="w-full flex-nowrap justify-between"
          buttonClassName="flex-1 min-w-0 max-[350px]:text-xs max-[350px]:py-1"
        />
      </div>

      <div
        role="tablist"
        aria-label="대본/댓글 탭"
        className="flex border-b border-gray-200"
        onKeyDown={handleTabKeyDown}
      >
        <button
          role="tab"
          id={TAB_IDS.script}
          aria-selected={mobileTab === 'script'}
          aria-controls={PANEL_IDS.script}
          onClick={() => setMobileTab('script')}
          className={getTabClassName(mobileTab === 'script')}
        >
          대본
        </button>
        <button
          role="tab"
          id={TAB_IDS.comment}
          aria-selected={mobileTab === 'comment'}
          aria-controls={PANEL_IDS.comment}
          onClick={() => setMobileTab('comment')}
          className={getTabClassName(mobileTab === 'comment')}
        >
          댓글 {comments.length > 0 && `${comments.length}`}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {mobileTab === 'script' ? (
          <div
            id={PANEL_IDS.script}
            role="tabpanel"
            aria-labelledby={TAB_IDS.script}
            className="px-4 py-4 max-[350px]:px-3 max-[350px]:py-3"
          >
            <ScriptSection
              slides={projectSlides}
              slideChangeTimes={slideChangeTimes}
              currentTime={currentTime}
              onSeek={requestSeek}
            />
          </div>
        ) : (
          <div
            id={PANEL_IDS.comment}
            role="tabpanel"
            aria-labelledby={TAB_IDS.comment}
            className="flex flex-col min-h-full"
          >
            <div className="flex-1">
              <CommentList
                comments={comments}
                onAddReply={addReply}
                onGoToRef={handleGoToTimeRef}
                onDeleteComment={deleteComment}
              />
            </div>
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-100 px-4 py-3 max-[350px]:px-3 max-[350px]:py-2">
              <CommentInput
                value={commentDraft}
                onChange={setCommentDraft}
                onSubmit={handleAddComment}
                onCancel={() => setCommentDraft('')}
                className="w-full"
                initialValueOnFocus={timestampPrefix}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
