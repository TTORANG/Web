/**
 * @file FeedbackSlidePage
 * @description 슬라이드 피드백 페이지
 *
 * 슬라이드 뷰어, 댓글 목록, 리액션 버튼을 포함합니다.
 * 좌우 키로 슬라이드 이동이 가능합니다.
 */
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import SlideNavigation from '@/components/feedback/SlideNavigation';
import SlideViewer from '@/components/feedback/SlideViewer';
import SlideTitle from '@/components/slide/script/SlideTitle';
import { createDefaultReactions } from '@/constants/reaction';
import type { ReadSharedContentData } from '@/types/share';
import { countTreeComments } from '@/utils/comment';
import { getSlideTitle } from '@/utils/slideTitle';

import { useFeedbackSlide } from './feedback/useFeedbackSlide';
import type { ShareExitSnapshot } from './feedback/useFeedbackVideo';

interface FeedbackSlidePageProps {
  sharedContent: ReadSharedContentData;
  onShareExitSnapshotChange: (snapshot: ShareExitSnapshot) => void;
}

export default function FeedbackSlidePage({
  sharedContent,
  onShareExitSnapshotChange,
}: FeedbackSlidePageProps) {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { state, actions } = useFeedbackSlide({
    sharedSlides: sharedContent.presentationContent.slides,
    sharedComments: sharedContent.presentationContent.comments,
    shareToken,
    onShareExitSnapshotChange,
  });

  const {
    currentSlide,
    totalSlides,
    slideIndex,
    script,
    comments,
    commentDraft,
    scrollToCommentId,
    reactions,
    isLoading,
    isCommentsLoading,
    commentsHasNextPage,
    commentsIsFetchingNextPage,
    isFirst,
    isLast,
  } = state;

  const {
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
  } = actions;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0">
      <div className="hidden md:flex flex-1 px-35">
        <SlideViewer
          slide={currentSlide}
          script={script}
          slideIndex={slideIndex}
          totalSlides={totalSlides}
          isFirst={isFirst}
          isLast={isLast}
          onPrev={goPrev}
          onNext={goNext}
        />

        <aside className="w-96 shrink-0 bg-gray-100 flex flex-col border-l border-gray-200">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
              scrollToCommentId={scrollToCommentId ?? undefined}
              onAddReply={addReply}
              onGoToRef={handleGoToRef}
              onDeleteComment={deleteComment}
              onUpdateComment={updateComment}
              isLoading={isCommentsLoading}
              hasNextPage={commentsHasNextPage}
              isFetchingNextPage={commentsIsFetchingNextPage}
              onLoadMore={commentsFetchNextPage}
            />
          </div>

          <div className="shrink-0 flex flex-col gap-6 px-4 pb-6 pt-2">
            <CommentInput
              value={commentDraft}
              onChange={setCommentDraft}
              onSubmit={handleAddComment}
              onCancel={() => setCommentDraft('')}
              className="items-end w-86"
            />
            <ReactionButtons
              reactions={reactions.length > 0 ? reactions : createDefaultReactions()}
              onToggleReaction={addReaction}
              layout="grid-2"
              buttonClassName="w-42.25"
            />
          </div>
        </aside>
      </div>

      <FeedbackMobileLayout
        mediaSlot={
          currentSlide ? (
            <img
              src={currentSlide.imageUrl}
              alt={getSlideTitle(currentSlide.title, slideIndex + 1)}
              className="max-h-full max-w-full"
            />
          ) : (
            <div className="py-20 text-black">슬라이드를 불러올 수 없습니다...</div>
          )
        }
        navigationSlot={
          <SlideNavigation
            slideIndex={slideIndex}
            totalSlides={totalSlides}
            isFirst={isFirst}
            isLast={isLast}
            onPrev={goPrev}
            onNext={goNext}
            layout="spread"
          />
        }
        reactionSlot={
          <ReactionButtons
            reactions={reactions.length > 0 ? reactions : createDefaultReactions()}
            onToggleReaction={addReaction}
            showLabel={false}
          />
        }
        scriptTabContent={
          <div className="px-4 py-4">
            <SlideTitle fallbackTitle={getSlideTitle(undefined, slideIndex + 1)} readOnly />
            <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-200 px-4 py-3 h-48 overflow-y-auto pb-4">
              <p
                className={`text-body-s leading-relaxed text-wrap-readable ${script ? 'text-black' : 'text-gray-600'}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {script || '대본이 없습니다.'}
              </p>
            </div>
          </div>
        }
        commentTabContent={
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CommentList
                comments={comments}
                scrollToCommentId={scrollToCommentId ?? undefined}
                onAddReply={addReply}
                onGoToRef={handleGoToRef}
                onDeleteComment={deleteComment}
                onUpdateComment={updateComment}
                isLoading={isLoading}
                hasNextPage={commentsHasNextPage}
                isFetchingNextPage={commentsIsFetchingNextPage}
                onLoadMore={commentsFetchNextPage}
              />
            </div>
            <div className="shrink-0 px-4 py-3">
              <CommentInput
                value={commentDraft}
                onChange={setCommentDraft}
                onSubmit={handleAddComment}
                onCancel={() => setCommentDraft('')}
                className="w-full"
              />
            </div>
          </>
        }
        commentCount={countTreeComments(comments)}
      />
    </div>
  );
}
