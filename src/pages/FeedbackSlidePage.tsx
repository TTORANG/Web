import { useEffect, useMemo } from 'react';

import DarkHeader from '@/components/common/DarkHeader';
import { MOCK_SLIDES, MOCK_UI_SLIDES } from '@/mocks/slides';
import { useSlideStore } from '@/stores/slideStore';

import CommentList from '../components/comment/CommentList';
import FeedbackInput from '../components/feedback/FeedbackInput';
import SlideViewer from '../components/feedback/SlideViewer';
import { useComments } from '../hooks/useComments';
import { useReactions } from '../hooks/useReactions';
import { useSlides } from '../hooks/useSlides';

export default function FeedbackSlidePage() {
  const slideLogic = useSlides();
  const { slideIndex } = slideLogic;

  const { comments, addComment, addReply, deleteComment } = useComments();
  const { reactions, toggleReaction } = useReactions();
  const initSlide = useSlideStore((state) => state.initSlide);

  const allFlatOpinions = useMemo(() => {
    return MOCK_SLIDES.flatMap((slide, index) => {
      const slideLabel = `슬라이드 ${index + 1}`;
      return (slide.opinions || []).map((op) => ({
        ...op,
        id: `${slide.id}-${op.id}`,
        parentId: op.parentId ? `${slide.id}-${op.parentId}` : undefined,
        slideRef: slideLabel,
      }));
    });
  }, []);

  useEffect(() => {
    const rawData = MOCK_SLIDES[slideIndex];
    const uiData = MOCK_UI_SLIDES[slideIndex];

    if (rawData && uiData) {
      initSlide({
        ...rawData,
        opinions: allFlatOpinions,
        emojiReactions: uiData.emojiReactions,
      });
    }
  }, [slideIndex, initSlide, allFlatOpinions]);

  return (
    <div className="fixed inset-0 z-60 flex h-screen w-screen flex-col overflow-hidden bg-gray-900">
      <DarkHeader title="Q4 마케팅 전략 발표" />

      <div className="flex flex-1 w-full min-h-0">
        <SlideViewer {...slideLogic} />

        <aside className="w-130 bg-gray-900 flex flex-col border-l border-white/5">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
              onAddReply={addReply}
              onGoToSlideRef={slideLogic.goToSlideRef}
              onDeleteComment={deleteComment}
            />
          </div>

          <div className="shrink-0 border-t border-white/5">
            <FeedbackInput
              reactions={reactions}
              onToggleReaction={toggleReaction}
              onAddComment={(content) => addComment(content, slideLogic.slideIndex)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
