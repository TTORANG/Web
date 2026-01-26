/**
 * @file FeedbackSlidePage.tsx
 * @description 피드백 슬라이드 페이지
 *
 * 슬라이드 뷰어, 댓글 목록, 리액션 버튼을 포함합니다.
 * 좌우 화살표 키로 슬라이드 이동이 가능합니다.
 */
import { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import SlideNavigation from '@/components/feedback/SlideNavigation';
import SlideViewer from '@/components/feedback/SlideViewer';
import SlideTitle from '@/components/slide/script/SlideTitle';
import { createDefaultReactions } from '@/constants/reaction';
import { useHotkey } from '@/hooks';
import { useSlides } from '@/hooks/queries/useSlides';
import { useSlideNavigation } from '@/hooks/useSlideNavigation';
import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';

import { useComments } from '../hooks/useComments';
import { useReactions } from '../hooks/useReactions';

export default function FeedbackSlidePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: slides, isLoading } = useSlides(projectId ?? '');

  const totalSlides = slides?.length ?? 0;
  const navigation = useSlideNavigation(totalSlides);
  const { slideIndex, goPrev, goNext, isFirst, isLast, goToIndex } = navigation;

  const currentSlide = slides?.[slideIndex];

  const { comments, addComment, addReply, deleteComment } = useComments();
  const { reactions, toggleReaction } = useReactions();
  const initSlide = useSlideStore((state) => state.initSlide);

  const [mobileTab, setMobileTab] = useState<'script' | 'comment'>('script');
  const [commentDraft, setCommentDraft] = useState('');
  const tabIds = {
    script: 'feedback-tab-script',
    comment: 'feedback-tab-comment',
  } as const;
  const panelIds = {
    script: 'feedback-panel-script',
    comment: 'feedback-panel-comment',
  } as const;

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, slideIndex);
    setCommentDraft('');
  };

  useHotkey({ ArrowLeft: goPrev, ArrowRight: goNext }, { enabled: !isLoading });

  /** 모든 슬라이드의 의견을 플랫 배열로 합침 */
  const allFlatOpinions = useMemo(() => {
    if (!slides) return [];
    return slides.flatMap((slide, index) => {
      const slideLabel = `Slide ${index + 1}`;
      return (slide.opinions || []).map((op) => ({
        ...op,
        id: `${slide.id}-${op.id}`,
        parentId: op.parentId ? `${slide.id}-${op.parentId}` : undefined,
        serverId: op.id,
        slideId: slide.id,
        slideRef: slideLabel,
        ref: { kind: 'slide' as const, index },
      }));
    });
  }, [slides]);

  /** 슬라이드 변경 시 store 초기화 */
  useEffect(() => {
    if (!currentSlide) return;

    initSlide({
      ...currentSlide,
      opinions: allFlatOpinions,
      emojiReactions:
        currentSlide.emojiReactions && currentSlide.emojiReactions.length > 0
          ? currentSlide.emojiReactions
          : createDefaultReactions(),
    });
  }, [slideIndex, currentSlide, initSlide, allFlatOpinions]);

  const handleGoToRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind !== 'slide') return;
      goToIndex(ref.index);
    },
    [goToIndex],
  );

  const handleTabKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setMobileTab((prev) => {
      if (prev === 'script') return event.key === 'ArrowRight' ? 'comment' : 'script';
      return event.key === 'ArrowLeft' ? 'script' : 'comment';
    });
  }, []);

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
              reactions={reactions}
              onToggleReaction={toggleReaction}
              layout="grid-2"
              buttonClassName="w-42.25"
            />
          </div>
        </aside>
      </div>

      <div className="flex md:hidden flex-1 flex-col bg-gray-100">
        <div className="py-2 px-4 pt-4">
          {currentSlide ? (
            <div className="flex items-center justify-center">
              <img
                src={currentSlide.thumb}
                alt={currentSlide.title}
                className="max-h-full max-w-full shadow-lg"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-600">
              슬라이드를 불러오는 중...
            </div>
          )}
        </div>

        <div className="shrink-0 px-4 pb-3 pt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SlideNavigation
              slideIndex={slideIndex}
              totalSlides={totalSlides}
              isFirst={isFirst}
              isLast={isLast}
              onPrev={goPrev}
              onNext={goNext}
              layout="spread"
              className="w-full"
            />
          </div>
          <ReactionButtons
            reactions={reactions}
            onToggleReaction={toggleReaction}
            showLabel={false}
            className="w-full flex-nowrap justify-between"
            buttonClassName="flex-1 min-w-0"
          />
        </div>

        <div
          role="tablist"
          aria-label="슬라이드 탭"
          className="flex border-b border-gray-200"
          onKeyDown={handleTabKeyDown}
        >
          <button
            role="tab"
            id={tabIds.script}
            aria-selected={mobileTab === 'script'}
            aria-controls={panelIds.script}
            onClick={() => setMobileTab('script')}
            className={`flex-1 py-3 text-body-m-bold transition-colors ${
              mobileTab === 'script' ? 'text-main border-b border-main-variant1' : 'text-gray-600'
            }`}
          >
            스크립트
          </button>
          <button
            role="tab"
            id={tabIds.comment}
            aria-selected={mobileTab === 'comment'}
            aria-controls={panelIds.comment}
            onClick={() => setMobileTab('comment')}
            className={`flex-1 py-3 text-body-m-bold transition-colors ${
              mobileTab === 'comment' ? 'text-main border-b border-main-variant1' : 'text-gray-600'
            }`}
          >
            댓글 {comments.length > 0 && `${comments.length}`}
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {mobileTab === 'script' ? (
            <div
              id={panelIds.script}
              role="tabpanel"
              aria-labelledby={tabIds.script}
              className="px-4 py-4"
            >
              <SlideTitle fallbackTitle={`슬라이드 ${slideIndex + 1}`} />
              <div className="mt-3 bg-gray-200 rounded-lg px-4 py-3 h-48 overflow-y-auto">
                <p
                  className={`text-body-s ${currentSlide?.script ? 'text-black' : 'text-gray-600'}`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {currentSlide?.script || '대본이 없습니다.'}
                </p>
              </div>
            </div>
          ) : (
            <div
              id={panelIds.comment}
              role="tabpanel"
              aria-labelledby={tabIds.comment}
              className="flex flex-col min-h-full"
            >
              <div className="flex-1">
                <CommentList
                  comments={comments}
                  onAddReply={addReply}
                  onGoToRef={handleGoToRef}
                  onDeleteComment={deleteComment}
                />
              </div>
              <div className="sticky bottom-0 border-t border-gray-200 bg-gray-100 px-4 py-3">
                <CommentInput
                  value={commentDraft}
                  onChange={setCommentDraft}
                  onSubmit={handleAddComment}
                  onCancel={() => setCommentDraft('')}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
