/**
 * @file ReactionButtons.tsx
 * @description Emoji reaction buttons
 */
import { REACTION_CONFIG } from '@/constants/reaction';
import type { Reaction, ReactionType } from '@/types/script';

interface ReactionButtonsProps {
  /** Reaction list */
  reactions: Reaction[];
  /** Toggle handler */
  onToggleReaction: (type: ReactionType) => void;
  /** Layout mode */
  layout?: 'flex' | 'grid-2';
  /** Show labels */
  showLabel?: boolean;
  /** Container className */
  className?: string;
  /** Button className */
  buttonClassName?: string;
}

/**
 * Emoji reaction buttons
 */
export default function ReactionButtons({
  reactions,
  onToggleReaction,
  layout = 'flex',
  showLabel = true,
  className,
  buttonClassName,
}: ReactionButtonsProps) {
  const formatReactionCount = (count: number) => (count > 99 ? '99+' : count);
  const isGrid = layout === 'grid-2';
  const total = reactions.length;
  const containerClass = isGrid
    ? `grid grid-cols-2 gap-2 justify-items-center ${className ?? ''}`
    : `flex gap-1.5 ${showLabel ? 'flex-wrap' : 'flex-nowrap'} ${className ?? ''}`;

  return (
    <div className={containerClass}>
      {reactions.map((reaction, index) => {
        const config = REACTION_CONFIG[reaction.type];
        const isLastOdd = isGrid && total % 2 === 1 && index === total - 1;
        const baseBtn =
          'flex items-center justify-between px-2 py-2 rounded-full border transition text-body-m focus-visible:outline-2 focus-visible:outline-main';

        const widthClass = showLabel ? 'w-42.25' : 'w-auto flex-1';

        return (
          <button
            key={reaction.type}
            onClick={() => onToggleReaction(reaction.type)}
            className={`${baseBtn} ${widthClass} ${buttonClassName ?? ''} ${
              isLastOdd ? 'col-span-2 justify-self-start' : ''
            } ${
              reaction.active
                ? 'bg-gray-900 border-main-variant1 text-black'
                : 'bg-gray-200 border-gray-400 text-black hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{config.emoji}</span>
              {showLabel && (
                <span
                  className={`whitespace-nowrap ${
                    reaction.active ? 'text-main-variant2 text-body-m-bold' : ''
                  }`}
                >
                  {config.label}
                </span>
              )}
            </div>

            <span
              className={`tabular-nums text-right min-w-0 ${
                reaction.active ? 'text-main-variant2 text-body-m-bold' : ''
              }`}
            >
              {reaction.count > 0 ? formatReactionCount(reaction.count) : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
