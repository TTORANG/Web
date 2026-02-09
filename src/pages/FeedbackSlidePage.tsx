/**
 * @file FeedbackSlidePage
 * @description 피드백 슬라이드 페이지
 *
 * 슬라이드 뷰어, 댓글 목록, 리액션 버튼을 포함합니다.
 * 좌우 화살표 키로 슬라이드 이동이 가능합니다.
 */
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import WebSocketDebug from '@/components/common/WebSocketDebug';
import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import SlideNavigation from '@/components/feedback/SlideNavigation';
import SlideViewer from '@/components/feedback/SlideViewer';
import SlideTitle from '@/components/slide/script/SlideTitle';
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

export default function FeedbackSlidePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: slides, isLoading } = useSlides(projectId ?? '');

  const { isConnected, currentRooms, joinProject, leaveProject, getRooms } = useFeedbackWebSocket({
    projectId: projectId ?? '',
    enabled: !!projectId,
  });

  const totalSlides = slides?.length ?? 0;
  const navigation = useSlideNavigation(totalSlides);
  const { slideIndex, goPrev, goNext, isFirst, isLast, goToIndex } = navigation;

  const currentSlide = slides?.[slideIndex];

  const { comments, addComment, addReply, deleteComment, updateComment } =
    useSlideCommentsActions();
  const { reactions, toggleReaction } = useSlideReactions();
  const script = useSlideStore((state) => state.slide?.script ?? '');
  const initSlide = useSlideStore((state) => state.initSlide);
  const { updateScript } = useSlideActions();
  const { data: scriptData } = useScript(currentSlide?.slideId ?? '');

  const [commentDraft, setCommentDraft] = useState('');

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, slideIndex);
    setCommentDraft('');
  };

  const mapComments = useCallback(
    (comments: Comment[]) => {
      if (!currentSlide) return comments;
      const slideLabel = `Slide ${slideIndex + 1}`;
      return comments.map((comment) => ({
        ...comment,
        slideId: currentSlide.slideId,
        ref: { kind: 'slide' as const, index: slideIndex },
        slideRef: slideLabel,
      }));
    },
    [currentSlide, slideIndex],
  );

  useHotkey({ ArrowLeft: goPrev, ArrowRight: goNext }, { enabled: !isLoading });

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

  useEffect(() => {
    if (!currentSlide) return;

    initSlide({
      ...currentSlide,
      emojiReactions: createDefaultReactions(),
    });
    updateScript('');
  }, [slideIndex, currentSlide, initSlide, updateScript]);

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
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
              onAddReply={addReply}
              onGoToRef={handleGoToRef}
              onDeleteComment={deleteComment}
              onUpdateComment={updateComment}
              isLoading={isLoading || isCommentsLoading}
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
              onToggleReaction={toggleReaction}
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
              alt={currentSlide.title}
              className="max-h-full max-w-full"
            />
          ) : (
            <div className="py-20 text-black">????? ???? ?...</div>
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
            onToggleReaction={toggleReaction}
            showLabel={false}
          />
        }
        scriptTabContent={
          <div className="px-4 py-4">
            <SlideTitle fallbackTitle={`???? ${slideIndex + 1}`} readOnly />
            <div className="mt-3 bg-gray-200 rounded-lg px-4 py-3 h-48 overflow-y-auto">
              <p
                className={`text-body-s ${script ? 'text-black' : 'text-gray-400'}`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {script || '??? ????.'}
              </p>
            </div>
          </div>
        }
        commentTabContent={
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CommentList
                comments={comments}
                onAddReply={addReply}
                onGoToRef={handleGoToRef}
                onDeleteComment={deleteComment}
                onUpdateComment={updateComment}
                isLoading={isLoading}
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
        commentCount={comments.length}
      />

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
