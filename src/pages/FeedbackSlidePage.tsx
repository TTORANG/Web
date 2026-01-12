// pages/FeedbackSlidePage.tsx
import CommentList from '../components/comment/CommentList';
import FeedbackInput from '../components/feedback/FeedbackInput';
import SlideViewer from '../components/feedback/SlideViewer';
import { useComments } from '../hooks/useComments';
import { useReactions } from '../hooks/useReactions';
import { useSlides } from '../hooks/useSlides';

export default function FeedbackSlidePage() {
  const slideLogic = useSlides();
  const { comments, addComment, addReply, deleteComment } = useComments();
  const { reactions, toggleReaction } = useReactions();

  return (
    <div className="flex h-full w-full bg-gray-900 overflow-hidden">
      {/* === [LEFT WRAPPER] 슬라이드 영역 === */}
      <SlideViewer {...slideLogic} />

      {/* === [RIGHT SIDEBAR] 우측 긴 영역 === */}
      <aside className="w-[520px] bg-gray-900 flex flex-col">
        {/* 댓글 리스트 */}
        <CommentList
          comments={comments}
          onAddReply={addReply}
          onGoToSlideRef={slideLogic.goToSlideRef}
          onDeleteComment={deleteComment}
        />

        {/* 입력창 및 리액션 바 */}
        <FeedbackInput
          reactions={reactions}
          onToggleReaction={toggleReaction}
          onAddComment={(content) => addComment(content, slideLogic.slideIndex)}
        />
      </aside>
    </div>
  );
}
