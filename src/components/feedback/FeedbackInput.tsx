// 우측 하단 입력 및 리액션 바
// components/feedback/FeedbackInput.tsx
import { useRef, useState } from 'react';

import type { EmojiReaction } from '@/types/script';

interface Props {
  reactions: EmojiReaction[];
  onToggleReaction: (emoji: string) => void;
  onAddComment: (content: string) => void;
  // 'all'(기존), 'reactions-only'(중간바), 'input-only'(댓글탭하단)
  viewType?: 'all' | 'reactions-only' | 'input-only';
}

export default function FeedbackInput({
  reactions,
  onToggleReaction,
  onAddComment,
  viewType = 'all',
}: Props) {
  const [commentDraft, setCommentDraft] = useState('');
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const showInput = viewType === 'all' || viewType === 'input-only';
  const showReactions = viewType === 'all' || viewType === 'reactions-only';

  const handleAddComment = () => {
    onAddComment(commentDraft);
    setCommentDraft('');
    if (commentTextareaRef.current) {
      commentTextareaRef.current.style.height = 'auto';
    }
  };

  const handleCancel = () => {
    setCommentDraft('');
    if (commentTextareaRef.current) {
      commentTextareaRef.current.style.height = 'auto';
    }
  };

  const formatReactionCount = (count: number) => (count > 99 ? '99+' : count);

  const isMobileReactionsOnly = viewType === 'reactions-only';

  return (
    <div className={`${viewType === 'all' ? 'mr-35 p-4' : 'p-1'} bg-gray-900`}>
      {/* 댓글 입력 영역 */}
      {showInput && (
        <div className="mb-1 mx-2">
          <textarea
            ref={commentTextareaRef}
            placeholder="댓글을 입력하세요..."
            value={commentDraft}
            rows={1}
            onChange={(e) => {
              setCommentDraft(e.target.value);
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            className="w-full overflow-hidden resize-none bg-transparent border-b border-gray-400 focus:border-white outline-none py-2 text-body-m-bold text-white placeholder-gray-400 transition-colors"
          />

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-full text-caption-bold text-gray-200 bg-gray-900 hover:bg-gray-800 transition"
            >
              취소
            </button>

            <button
              type="button"
              onClick={handleAddComment}
              className="px-3 py-1.5 rounded-full text-caption-bold text-gray-400 bg-white hover:bg-white/20 transition"
            >
              답글
            </button>
          </div>
        </div>
      )}

      {/* 이모지 리액션 영역 */}
      {showReactions && (
        <div className={`items-center ${viewType === 'all' ? 'mt-3' : ''}`}>
          {/* viewType이 reactions-only(모바일)일 때는 가로 스크롤(flex), 데스크탑은 그리드 */}
          <div
            className={`${
              viewType === 'reactions-only'
                ? // 모바일
                  'flex flex-wrap w-full justify-between gap-x-2 gap-y-2'
                : // 데스크탑
                  'grid grid-cols-2 gap-2'
            }`}
          >
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onToggleReaction(reaction.emoji)}
                className={[
                  'flex items-center justify-between px-2 py-1.5 rounded-full transition',
                  reaction.active
                    ? 'bg-gray-100 text-main-variant2 text-body-m-bold ring-1 ring-main-variant1'
                    : 'bg-gray-800 ring-1 text-body-m ring-gray-600 text-white hover:bg-gray-800',

                  isMobileReactionsOnly ? 'flex-1 basis-[35px] max-w-[120px]' : '',
                ].join(' ')}
              >
                <div className="flex items-center min-w-0">
                  <span className="flex-shrink-0">{reaction.emoji}</span>
                  <span
                    className={`whitespace-nowrap overflow-hidden ${viewType === 'reactions-only' ? 'hidden' : ''}`}
                  >
                    {reaction.label}
                  </span>
                </div>

                {reaction.count > 0 && (
                  <span className={`flex-shrink-0 ml-1 ${reaction.active ? 'font-bold' : ''}`}>
                    {formatReactionCount(reaction.count)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
