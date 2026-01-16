// 우측 하단 입력 및 리액션 바
// components/feedback/FeedbackInput.tsx
import { useRef, useState } from 'react';

import { type EmojiReaction, REACTION_CONFIG, type ReactionType } from '@/types/script';

interface Props {
  reactions: EmojiReaction[];
  onToggleReaction: (type: ReactionType) => void;
  onAddComment: (content: string) => void;
}

export default function FeedbackInput({ reactions, onToggleReaction, onAddComment }: Props) {
  const [commentDraft, setCommentDraft] = useState('');
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
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

  const isCommentEmpty = !commentDraft.trim();

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
      {/* 댓글 입력 영역 - 이모지 버튼 2개 너비에 맞춤 */}
      <div className="flex flex-col gap-1 items-end w-86">
        <div className="w-full border-b border-gray-600 px-0.5 py-2">
          <textarea
            ref={commentTextareaRef}
            placeholder="댓글을 입력하세요"
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
            className="w-full overflow-hidden resize-none bg-transparent outline-none text-body-m-bold text-black placeholder-gray-600"
          />
        </div>

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 text-caption-bold text-gray-800 hover:opacity-80 transition"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleAddComment}
            disabled={isCommentEmpty}
            className={`px-3 py-1.5 rounded-full text-caption-bold transition ${
              isCommentEmpty
                ? 'bg-white text-gray-400 cursor-not-allowed'
                : 'bg-main text-white hover:opacity-90'
            }`}
          >
            답글
          </button>
        </div>
      </div>

      {/* 이모지 리액션 버튼 */}
      <div className="flex flex-wrap gap-2">
        {reactions.map((reaction) => {
          const config = REACTION_CONFIG[reaction.type];
          return (
            <button
              key={reaction.type}
              onClick={() => onToggleReaction(reaction.type)}
              className={`w-[169px] flex items-center justify-between px-3 py-2 rounded-full border transition text-body-m ${
                reaction.active
                  ? 'bg-gray-900 border-main-variant1 text-main-variant2 font-semibold'
                  : 'bg-gray-200 border-gray-400 text-black hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{config.emoji}</span>
                <span className="whitespace-nowrap">{config.label}</span>
              </div>

              {reaction.count > 0 && (
                <span className={reaction.active ? 'font-semibold' : ''}>
                  {formatReactionCount(reaction.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
