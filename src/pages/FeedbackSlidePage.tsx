import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import SlideViewer from '@/components/feedback/SlideViewer';
import { useHotkey } from '@/hooks';
import { useSlides } from '@/hooks/queries/useSlides';
import { useSlideNavigation } from '@/hooks/useSlideNavigation';
import { useSlideStore } from '@/stores/slideStore';

import { useComments } from '../hooks/useComments';
import { useReactions } from '../hooks/useReactions';

export default function FeedbackSlidePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: slides, isLoading } = useSlides(projectId ?? '');

  const totalSlides = slides?.length ?? 0;
  const navigation = useSlideNavigation(totalSlides);
  const { slideIndex, goPrev, goNext, isFirst, isLast, goToSlideRef } = navigation;

  const currentSlide = slides?.[slideIndex];

  const { comments, addComment, addReply, deleteComment } = useComments();
  const { reactions, toggleReaction } = useReactions();
  const initSlide = useSlideStore((state) => state.initSlide);

  const [commentDraft, setCommentDraft] = useState('');

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, slideIndex);
    setCommentDraft('');
  };

  // 단축키 설정: 좌우 방향키로 슬라이드 이동
  useHotkey(
    {
      ArrowLeft: goPrev,
      ArrowRight: goNext,
    },
    { enabled: !isLoading },
  );

  // 모든 슬라이드의 의견을 하나의 플랫 배열로 합침 (슬라이드 참조 포함)
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

  // 현재 슬라이드 데이터를 store에 초기화
  useEffect(() => {
    if (!currentSlide) return;

    initSlide({
      ...currentSlide,
      opinions: allFlatOpinions,
    });
  }, [slideIndex, currentSlide, initSlide, allFlatOpinions]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full px-35">
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
            onGoToSlideRef={goToSlideRef}
            onDeleteComment={deleteComment}
          />
        </div>

        <div className="shrink-0 border-t border-black/5 flex flex-col gap-6 px-4 pb-6 pt-2">
          <CommentInput
            value={commentDraft}
            onChange={setCommentDraft}
            onSubmit={handleAddComment}
            onCancel={() => setCommentDraft('')}
            className="items-end w-86"
          />
          <ReactionButtons reactions={reactions} onToggleReaction={toggleReaction} />
        </div>
      </aside>
    </div>
  );
}
