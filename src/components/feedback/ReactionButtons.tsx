/**
 * @file ReactionButtons.tsx
 * @description 이모지 리액션 버튼 목록
 *
 * 피드백 화면 하단에서 슬라이드에 대한 리액션을 표시합니다.
 */
import clsx from 'clsx';

import { type EmojiReaction, REACTION_CONFIG, type ReactionType } from '@/types/script';

interface ReactionButtonsProps {
  /** 리액션 목록 (타입, 카운트, 활성화 여부) */
  reactions: EmojiReaction[];
  /** 리액션 토글 핸들러 */
  onToggleReaction: (type: ReactionType) => void;
  theme?: 'light' | 'dark';
  layout?: 'wrap' | 'row';
  className?: string;
}

/**
 * 이모지 리액션 버튼 목록
 *
 * @example
 * <ReactionButtons
 *   reactions={reactions}
 *   onToggleReaction={toggleReaction}
 * />
 */
export default function ReactionButtons({
  reactions,
  onToggleReaction,
  theme = 'light',
  layout = 'wrap',
  className,
}: ReactionButtonsProps) {
  /** 99 초과 시 '99+'로 표시 */
  const formatReactionCount = (count: number) => (count > 99 ? '99+' : count);
  const isDark = theme === 'dark';

  return (
    <div
      className={clsx(
        'flex gap-2',
        layout === 'row' ? 'w-full flex-nowrap' : 'flex-wrap',
        className,
      )}
    >
      {reactions.map((reaction) => {
        const config = REACTION_CONFIG[reaction.type];
        return (
          <button
            key={reaction.type}
            onClick={() => onToggleReaction(reaction.type)}
            className={clsx(
              layout === 'row' ? 'flex-1' : 'w-42.25',
              'flex items-center justify-between px-3 py-2 rounded-full border transition text-body-m focus-visible:outline-1 focus-visible:outline-main',
              reaction.active
                ? 'bg-gray-100 border-main-variant1 text-main-variant2 text-body-m-bold'
                : isDark
                  ? 'bg-gray-800 border-gray-600 text-gray-100 hover:border-gray-500'
                  : 'bg-gray-200 border-gray-600 text-black hover:border-gray-600',
            )}
          >
            <div className="flex items-center gap-2">
              <span>{config.emoji}</span>
              {layout !== 'row' && <span className="whitespace-nowrap">{config.label}</span>}
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
