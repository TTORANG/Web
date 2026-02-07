/**
 * @file ReactionButtons.tsx
 * @description Emoji reaction buttons
 */
import { useState } from 'react';

import { EmojiConfetti } from '@/components/common';
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
  // confetti 트리거를 위한 카운터 (리액션 타입별)
  const [confettiTriggers, setConfettiTriggers] = useState<Partial<Record<ReactionType, number>>>(
    {},
  );

  const formatReactionCount = (count: number) => (count > 99 ? '99+' : count);
  const isGrid = layout === 'grid-2';
  const total = reactions.length;
  const containerClass = isGrid
    ? `grid grid-cols-2 gap-2 justify-items-center ${className ?? ''}`
    : `flex gap-2 ${showLabel ? 'flex-wrap' : 'flex-nowrap justify-center overflow-hidden'} ${className ?? ''}`;

  const handleToggle = (type: ReactionType, isCurrentlyActive: boolean) => {
    // 활성화될 때만 confetti 효과 트리거
    if (!isCurrentlyActive) {
      setConfettiTriggers((prev) => ({
        ...prev,
        [type]: (prev[type] || 0) + 1,
      }));
    }
    onToggleReaction(type);
  };

  return (
    <div className={containerClass}>
      {reactions.map((reaction, index) => {
        const config = REACTION_CONFIG[reaction.type];
        const isLastOdd = isGrid && total % 2 === 1 && index === total - 1;
        const baseBtn = showLabel
          ? 'flex items-center justify-between px-2 py-2 rounded-full border transition text-body-m focus-visible:outline-2 focus-visible:outline-main w-42.25'
          : 'flex items-center gap-2 px-3 py-2 rounded-full border transition text-body-m focus-visible:outline-2 focus-visible:outline-main shrink-0';

        return (
          <button
            key={reaction.type}
            onClick={() => handleToggle(reaction.type, reaction.active ?? false)}
            className={`${baseBtn} ${buttonClassName ?? ''} ${
              isLastOdd ? 'col-span-2 justify-self-start' : ''
            } ${
              reaction.active
                ? 'bg-gray-900 border-main-variant1 text-main-variant2 text-body-m-bold'
                : 'bg-gray-200 border-gray-400 text-black hover:border-gray-600'
            } relative`}
          >
            {showLabel ? (
              <>
                <div className="flex items-center gap-2">
                  <span>{config.emoji}</span>
                  <span className="whitespace-nowrap">{config.label}</span>
                </div>
                <span className="tabular-nums text-right min-w-0">
                  {reaction.count > 0 ? formatReactionCount(reaction.count) : ''}
                </span>
              </>
            ) : (
              <>
                <span>{config.emoji}</span>
                <span className="tabular-nums min-w-4 text-right">
                  {reaction.count > 0 ? formatReactionCount(reaction.count) : ''}
                </span>
              </>
            )}

            {confettiTriggers[reaction.type] && confettiTriggers[reaction.type]! > 0 && (
              <EmojiConfetti key={confettiTriggers[reaction.type]} emoji={config.emoji} />
            )}
          </button>
        );
      })}
    </div>
  );
}
