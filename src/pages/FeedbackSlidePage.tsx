/**
 * @file FeedbackSlidePage.tsx
 * @description 피드백 슬라이드 페이지 (Logic: Develop, UI: HEAD + Develop Components)
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { queryClient, queryKeys } from '@/api';
// 아이콘 및 공통 컴포넌트
import LeftArrow from '@/assets/icons/icon-arrow-left.svg?react';
import RightArrow from '@/assets/icons/icon-arrow-right.svg?react';
// [New] 분리된 컴포넌트 Import
import { CommentInput } from '@/components/comment';
// 하위 컴포넌트
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import DarkHeader from '@/components/common/DarkHeader';
// develop 브랜치의 입력창
import ReactionButtons from '@/components/feedback/ReactionButtons';
import SlideViewer from '@/components/feedback/SlideViewer';
import { useHotkey } from '@/hooks';
// develop 브랜치의 리액션 버튼

// API 및 네비게이션
import { useSlides, useUpdateSlide } from '@/hooks/queries/useSlides';
import { useComments } from '@/hooks/useComments';
import { useReactions } from '@/hooks/useReactions';
import { useSlideNavigation } from '@/hooks/useSlideNavigation';
import { useSlideStore } from '@/stores/slideStore';
import type { Slide } from '@/types/slide';

export default function FeedbackSlidePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const resolvedProjectId = projectId ?? (import.meta.env.DEV ? 'mock' : '');
  const { data: slides, isLoading } = useSlides(resolvedProjectId);

  const totalSlides = slides?.length ?? 0;
  const navigation = useSlideNavigation(totalSlides);
  const { slideIndex, goPrev, goNext, isFirst, isLast, goToSlideRef } = navigation;

  const currentSlide = slides?.[slideIndex];

  const { comments, addComment, addReply, deleteComment } = useComments();
  const { reactions, toggleReaction } = useReactions();
  const initSlide = useSlideStore((state) => state.initSlide);
  const { mutate: updateSlideTitle } = useUpdateSlide();

  // 모바일 탭 상태
  const [mobileTab, setMobileTab] = useState<'script' | 'comment'>('script');

  // [New] 댓글 입력 상태 관리 (CommentInput을 위해 상위로 끌어올림)
  const [commentDraft, setCommentDraft] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');

  // [New] 댓글 전송 핸들러
  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, slideIndex);
    setCommentDraft('');
  };

  const startTitleEdit = () => {
    if (!currentSlide) return;
    setDraftTitle(currentSlide.title);
    setIsEditingTitle(true);
  };

  const cancelTitleEdit = () => {
    setIsEditingTitle(false);
    setDraftTitle(currentSlide?.title ?? '');
  };

  const commitTitle = () => {
    if (!currentSlide) return;
    const fallbackTitle = `슬라이드 ${slideIndex + 1}`;
    const nextTitle = draftTitle.trim() || fallbackTitle;

    if (!nextTitle || nextTitle === currentSlide.title) {
      setIsEditingTitle(false);
      setDraftTitle(currentSlide.title || fallbackTitle);
      return;
    }

    // Optimistically update list cache for immediate UI feedback.
    queryClient.setQueryData<Slide[] | undefined>(
      queryKeys.slides.list(resolvedProjectId),
      (prev) =>
        prev
          ? prev.map((slide) =>
              slide.id === currentSlide.id ? { ...slide, title: nextTitle } : slide,
            )
          : prev,
    );

    updateSlideTitle(
      { slideId: currentSlide.id, data: { title: nextTitle } },
      {
        onError: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.slides.list(resolvedProjectId) });
          setDraftTitle(currentSlide.title);
        },
      },
    );

    setIsEditingTitle(false);
  };

  useHotkey({ ArrowLeft: goPrev, ArrowRight: goNext }, { enabled: !isLoading });

  const allFlatOpinions = useMemo(() => {
    if (!slides) return [];
    return slides.flatMap((slide, index) => {
      const slideLabel = `슬라이드 ${index + 1}`;
      return (slide.opinions || []).map((op) => ({
        ...op,
        id: `${slide.id}-${op.id}`,
        parentId: op.parentId ? `${slide.id}-${op.parentId}` : undefined,
        slideRef: slideLabel,
      }));
    });
  }, [slides]);

  useEffect(() => {
    if (!currentSlide) return;
    initSlide(
      {
        ...currentSlide,
        opinions: allFlatOpinions,
        emojiReactions: currentSlide.emojiReactions || [],
      },
      slideIndex,
    );
  }, [slideIndex, currentSlide, initSlide, allFlatOpinions]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <Spinner size={40} />
      </div>
    );
  }

  // SlideViewer에 넘길 더미 props
  const titleEditProps = {
    isEditingTitle,
    draftTitle,
    setDraftTitle,
    startTitleEdit,
    commitTitle,
    cancelTitleEdit,
  };

  return (
    <div className="fixed inset-0 z-[60] flex h-screen w-screen flex-col overflow-hidden bg-gray-900">
      <DarkHeader title="Q4 마케팅 전략 발표" />

      {/** [Desktop Layout] */}
      <div className="hidden md:flex flex-1 w-full min-h-0">
        <SlideViewer
          slide={currentSlide}
          slideIndex={slideIndex}
          totalSlides={totalSlides}
          isFirst={isFirst}
          isLast={isLast}
          goPrev={goPrev}
          goNext={goNext}
          viewMode="desktop"
          {...titleEditProps}
        />

        <aside className="w-[520px] bg-gray-900 flex flex-col border-l border-gray-800">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
              onAddReply={addReply}
              onGoToSlideRef={goToSlideRef}
              onDeleteComment={deleteComment}
              theme="dark"
            />
          </div>

          {/* [Changed] develop 스타일: CommentInput + ReactionButtons 조합 */}
          <div className="shrink-0 flex flex-col gap-4 px-4 pb-6 pt-4 bg-gray-900">
            <CommentInput
              value={commentDraft}
              onChange={setCommentDraft}
              onSubmit={handleAddComment}
              onCancel={() => setCommentDraft('')}
              // 다크 모드용 스타일 추가 (필요 시 CommentInput 내부 수정 필요)
              className="items-end w-full pr-10 md:pr-35"
              theme="dark"
            />
            <ReactionButtons reactions={reactions} onToggleReaction={toggleReaction} theme="dark" />
          </div>
        </aside>
      </div>

      {/** [Mobile Layout] */}
      <div className="flex md:hidden flex-col flex-1 w-full overflow-hidden">
        <div className="w-full shrink-0">
          <SlideViewer
            slide={currentSlide}
            slideIndex={slideIndex}
            totalSlides={totalSlides}
            isFirst={isFirst}
            isLast={isLast}
            goPrev={goPrev}
            goNext={goNext}
            viewMode="mobile-screen"
            {...titleEditProps}
          />
        </div>

        <div className="flex flex-col gap-3 p-3 bg-gray-900 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={isFirst}
              className={`grid h-8 w-8 place-items-center rounded-full ${
                isFirst
                  ? 'bg-gray-800 opacity-30 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 active:scale-95 transition'
              }`}
            >
              <LeftArrow className="text-white h-5 w-5" />
            </button>

            <span className="text-body-m-bold text-gray-200 text-center">
              {slideIndex + 1} / {totalSlides}
            </span>

            <button
              onClick={goNext}
              disabled={isLast}
              className={`grid h-8 w-8 place-items-center rounded-full ${
                isLast
                  ? 'bg-gray-800 opacity-30 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 active:scale-95 transition'
              }`}
            >
              <RightArrow className="text-white h-5 w-5" />
            </button>
          </div>

          <div className="w-full overflow-hidden">
            {/* 모바일 상단 바에는 리액션 버튼만 표시 */}
            <ReactionButtons
              reactions={reactions}
              onToggleReaction={toggleReaction}
              theme="dark"
              layout="row"
              className="w-full"
            />
          </div>
        </div>

        {/* 탭 버튼 */}
        <div className="flex border-b border-gray-800 shrink-0 bg-gray-900">
          <button
            onClick={() => setMobileTab('script')}
            className={`flex-1 py-3 text-body-m-bold transition-colors relative ${
              mobileTab === 'script' ? 'text-main-variant1' : 'text-gray-400'
            }`}
          >
            대본
            {mobileTab === 'script' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-main-variant1" />
            )}
          </button>
          <button
            onClick={() => setMobileTab('comment')}
            className={`flex-1 py-3 text-body-m-bold transition-colors relative ${
              mobileTab === 'comment' ? 'text-main-variant1' : 'text-gray-400'
            }`}
          >
            댓글 {comments.length > 0 && `${comments.length}`}
            {mobileTab === 'comment' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-main-variant1" />
            )}
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-900">
          {mobileTab === 'script' ? (
            <div className="h-full">
              <SlideViewer
                slide={currentSlide}
                slideIndex={slideIndex}
                totalSlides={totalSlides}
                isFirst={isFirst}
                isLast={isLast}
                goPrev={goPrev}
                goNext={goNext}
                viewMode="mobile-script"
                {...titleEditProps}
              />
            </div>
          ) : (
            <div className="flex flex-col min-h-full">
              <div className="flex-1">
                <CommentList
                  comments={comments}
                  onAddReply={addReply}
                  onGoToSlideRef={goToSlideRef}
                  onDeleteComment={deleteComment}
                  theme="dark"
                />
              </div>
              {/* 모바일 댓글 탭 하단: 입력창만 표시 */}
              <div className="sticky bottom-0 bg-gray-900 p-2 border-t border-gray-800">
                <CommentInput
                  value={commentDraft}
                  onChange={setCommentDraft}
                  onSubmit={handleAddComment}
                  onCancel={() => setCommentDraft('')}
                  className="w-full"
                  theme="dark"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
