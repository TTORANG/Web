/**
 * @file ReactionButtons.tsx
 * @description 이모지 리액션 버튼 목록
 */
import { type EmojiReaction, REACTION_CONFIG, type ReactionType } from '@/types/script';

interface Props {
  reactions: EmojiReaction[];
  onToggleReaction: (type: ReactionType) => void;
}

export default function ReactionButtons({ reactions, onToggleReaction }: Props) {
  const formatReactionCount = (count: number) => (count > 99 ? '99+' : count);

  return (
    <div className="flex flex-wrap gap-2">
      {reactions.map((reaction) => {
        const config = REACTION_CONFIG[reaction.type];
        return (
          <button
            key={reaction.type}
            onClick={() => onToggleReaction(reaction.type)}
            className={`w-42.25 flex items-center justify-between px-3 py-2 rounded-full border transition text-body-m focus-visible:outline-2 focus-visible:outline-main ${
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
  );
}
