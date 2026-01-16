import { useEffect, useMemo, useState } from 'react';

import LeftArrow from '@/assets/icons/icon-arrow-left.svg?react';
import RightArrow from '@/assets/icons/icon-arrow-right.svg?react';
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
  const { slideIndex, totalSlides, isFirst, isLast, goPrev, goNext } = slideLogic;

  const { comments, addComment, addReply, deleteComment } = useComments();
  const { reactions, toggleReaction } = useReactions();
  const initSlide = useSlideStore((state) => state.initSlide);

  // 모바일 전용 탭 상태 ('script' | 'comment')
  const [mobileTab, setMobileTab] = useState<'script' | 'comment'>('script');

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
      // initSlide 호출 시 두 번째 인자로 slideIndex를 넘겨줍니다.
      initSlide(
        {
          ...rawData,
          opinions: allFlatOpinions,
          emojiReactions: uiData.emojiReactions,
        },
        slideIndex,
      ); // <--- 여기 slideIndex 추가!
    }
  }, [slideIndex, initSlide, allFlatOpinions]);

  return (
    <div className="fixed inset-0 z-[60] flex h-screen w-screen flex-col overflow-hidden bg-gray-900">
      <DarkHeader title="Q4 마케팅 전략 발표" />

      {/** [Desktop Layout] md 이상일 때만 표시 */}
      <div className="hidden md:flex flex-1 w-full min-h-0">
        <SlideViewer {...slideLogic} viewMode="desktop" />

        <aside className="w-[520px] bg-gray-900 flex flex-col border-l border-gray-800">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
              onAddReply={addReply}
              onGoToSlideRef={slideLogic.goToSlideRef}
              onDeleteComment={deleteComment}
            />
          </div>

          <div className="shrink-0">
            <FeedbackInput
              reactions={reactions}
              onToggleReaction={toggleReaction}
              onAddComment={(content) => addComment(content, slideLogic.slideIndex)}
              viewType="all"
            />
          </div>
        </aside>
      </div>

      {/** [Mobile Layout] md 미만일 때만 표시 */}
      <div className="flex md:hidden flex-col flex-1 w-full overflow-hidden">
        {/* 1. 슬라이드 뷰어 (화면만) */}
        <div className="w-full shrink-0">
          <SlideViewer {...slideLogic} viewMode="mobile-screen" />
        </div>

        {/* 2. 컨트롤 바 (2단 구조로 변경) */}
        <div className="flex flex-col gap-3 p-3 bg-gray-900 shrink-0">
          {/* 윗줄: < 1/5 > 네비게이션 */}
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

            {/* 페이지 번호 텍스트 */}
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

          {/* 아랫줄: 이모지 리스트 */}
          <div className="w-full overflow-hidden">
            <FeedbackInput
              reactions={reactions}
              onToggleReaction={toggleReaction}
              onAddComment={() => {}}
              viewType="reactions-only"
            />
          </div>
        </div>

        {/* 3. 탭 버튼 */}
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

        {/* 4. 탭 콘텐츠 영역 */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-900">
          {mobileTab === 'script' ? (
            <div className="h-full">
              <SlideViewer {...slideLogic} viewMode="mobile-script" />
            </div>
          ) : (
            <div className="flex flex-col min-h-full">
              <div className="flex-1 ">
                <CommentList
                  comments={comments}
                  onAddReply={addReply}
                  onGoToSlideRef={slideLogic.goToSlideRef}
                  onDeleteComment={deleteComment}
                />
              </div>
              <div className="sticky bottom-0 bg-gray-900">
                <FeedbackInput
                  reactions={reactions}
                  onToggleReaction={() => {}}
                  onAddComment={(content) => addComment(content, slideLogic.slideIndex)}
                  viewType="input-only"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
