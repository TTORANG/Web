/**
 * @file ReactionButtons.tsx
 * @description 이모지 리액션 버튼 목록
 *
 * 피드백 화면 하단에서 슬라이드에 대한 리액션을 표시합니다.
 */
import { REACTION_CONFIG } from '@/constants/reaction';
import type { Reaction, ReactionType } from '@/types/script';

interface ReactionButtonsProps {
  /** 리액션 목록 (타입, 카운트, 활성화 여부) */
  reactions: Reaction[];
  /** 리액션 토글 핸들러 */
  onToggleReaction: (type: ReactionType) => void;
  /** Show labels */
  showLabel?: boolean;
  /** Container className */
  className?: string;
  /** Button className */
  buttonClassName?: string;
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
  showLabel = true,
  className,
  buttonClassName,
}: ReactionButtonsProps) {
  /** 99 초과 시 '99+'로 표시 */
  const formatReactionCount = (count: number) => (count > 99 ? '99+' : count);

  return (
    <div className={`flex gap-2 ${showLabel ? 'flex-wrap' : 'flex-nowrap'} ${className ?? ''}`}>
      {reactions.map((reaction) => {
        const config = REACTION_CONFIG[reaction.type];
        return (
          <button
            key={reaction.type}
            onClick={() => onToggleReaction(reaction.type)}
            className={`flex items-center justify-between px-3 py-2 rounded-full border transition text-body-m focus-visible:outline-2 focus-visible:outline-main ${buttonClassName ?? ''} ${
              reaction.active
                ? 'bg-gray-900 border-main-variant1 text-main-variant2 text-body-m-bold'
                : 'bg-gray-200 border-gray-400 text-black hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{config.emoji}</span>
              {showLabel && <span className="whitespace-nowrap">{config.label}</span>}
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
