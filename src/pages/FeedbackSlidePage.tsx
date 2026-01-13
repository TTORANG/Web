// pages/FeedbackSlidePage.tsx
import { useEffect } from 'react';

// ✅ [수정] 원본 데이터(댓글용)와 UI 데이터(이모지/라벨용) 둘 다 가져옵니다.
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

  useEffect(() => {
    // 1. 댓글 데이터가 있는 원본 (Flat 구조 opinions)
    const rawData = MOCK_SLIDES[slideIndex];
    // 2. 이모지 라벨이 세팅된 UI용 데이터
    const uiData = MOCK_UI_SLIDES[slideIndex];

    if (rawData && uiData) {
      // ✅ [핵심] 두 데이터를 병합하여 초기화
      initSlide({
        ...rawData, // 기본 필드 + opinions (댓글) 사용
        emojiReactions: uiData.emojiReactions, // 이모지는 라벨이 있는 UI용 데이터로 덮어쓰기
      });
    }
  }, [slideIndex, initSlide]);

  return (
    <div className="flex h-full w-full bg-gray-900 overflow-hidden">
      <SlideViewer {...slideLogic} />

      <aside className="w-[520px] bg-gray-900 flex flex-col">
        <CommentList
          comments={comments}
          onAddReply={addReply}
          onGoToSlideRef={slideLogic.goToSlideRef}
          onDeleteComment={deleteComment}
        />

        <FeedbackInput
          reactions={reactions}
          onToggleReaction={toggleReaction}
          onAddComment={(content) => addComment(content, slideLogic.slideIndex)}
        />
      </aside>
    </div>
  );
}
