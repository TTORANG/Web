// 우측 하단 입력 및 리액션 바
// components/feedback/FeedbackInput.tsx
import { useRef, useState } from 'react';

import type { EmojiReaction } from '@/types/script';

interface Props {
  reactions: EmojiReaction[];
  onToggleReaction: (emoji: string) => void;
  onAddComment: (content: string) => void;
}

export default function FeedbackInput({ reactions, onToggleReaction, onAddComment }: Props) {
  const [commentDraft, setCommentDraft] = useState('');
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  return (
    <div className="mr-35 p-4 bg-gray-900">
      <div className="mb-1">
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
      </div>

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

      <div className="items-center mt-3">
        <div className="grid grid-cols-2 gap-2">
          {reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => onToggleReaction(reaction.emoji)}
              className={`flex items-center justify-between px-2 py-1.5 rounded-full transition ${
                reaction.active
                  ? 'bg-gray-100 text-main-variant2 text-body-m-bold ring-1 ring-main-variant1'
                  : 'bg-gray-800 ring-1 text-body-m ring-gray-600 text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0">{reaction.emoji}</span>
                <span className="whitespace-nowrap overflow-hidden">{reaction.label}</span>
              </div>

              {reaction.count > 0 && (
                <span className={`flex-shrink-0 ml-2 ${reaction.active ? 'font-bold' : ''}`}>
                  {formatReactionCount(reaction.count)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
