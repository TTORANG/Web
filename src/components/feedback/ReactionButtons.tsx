/**
 * @file ReactionButtons.tsx
 * @description Emoji reaction buttons
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { EmojiConfetti } from '@/components/common';
import { REACTION_CONFIG } from '@/constants/reaction';
import type { Reaction, ReactionType } from '@/types/script';

const MAX_SHAKE_INTENSITY = 3;
const DECAY_INTERVAL_MS = 500;

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

  // shake 강도 (연타 횟수 기반, 클릭 멈추면 1초마다 감소)
  const [shakeIntensities, setShakeIntensities] = useState<Partial<Record<ReactionType, number>>>(
    {},
  );
  // 감소 인터벌 (클릭 멈추면 1초마다 강도 -1)
  const decayIntervals = useRef<Partial<Record<ReactionType, ReturnType<typeof setInterval>>>>({});
  // 클릭 시 감소를 잠시 멈추기 위한 debounce 타이머
  const decayDebounce = useRef<Partial<Record<ReactionType, ReturnType<typeof setTimeout>>>>({});
  const clickCounts = useRef<Partial<Record<ReactionType, number>>>({});

  // 언마운트 시 타이머 정리
  useEffect(() => {
    const intervals = decayIntervals.current;
    const debounces = decayDebounce.current;
    return () => {
      Object.values(intervals).forEach((id) => {
        if (id) clearInterval(id);
      });
      Object.values(debounces).forEach((id) => {
        if (id) clearTimeout(id);
      });
    };
  }, []);

  const startDecay = useCallback((type: ReactionType) => {
    // 기존 인터벌 정리
    if (decayIntervals.current[type]) {
      clearInterval(decayIntervals.current[type]);
    }

    decayIntervals.current[type] = setInterval(() => {
      setShakeIntensities((prev) => {
        const current = prev[type] || 0;
        if (current <= 1) {
          // 0이 되면 인터벌 중지 & 클릭 카운트 리셋
          clearInterval(decayIntervals.current[type]);
          decayIntervals.current[type] = undefined;
          clickCounts.current[type] = 0;
          return { ...prev, [type]: 0 };
        }
        return { ...prev, [type]: current - 1 };
      });
    }, DECAY_INTERVAL_MS);
  }, []);

  const startShakeWindow = useCallback(
    (type: ReactionType) => {
      // 클릭 카운트 증가
      clickCounts.current[type] = (clickCounts.current[type] || 0) + 1;
      const clicks = clickCounts.current[type]!;

      // 2회 이상 클릭부터 shake 시작, 강도는 클릭 수에 비례 (최대 MAX_SHAKE_INTENSITY)
      const intensity = clicks >= 2 ? Math.min(clicks - 1, MAX_SHAKE_INTENSITY) : 0;
      setShakeIntensities((prev) => ({ ...prev, [type]: intensity }));

      // 연타 중에는 감소 인터벌 중지 → 클릭 멈추고 500ms 후 감소 시작
      if (decayIntervals.current[type]) {
        clearInterval(decayIntervals.current[type]);
        decayIntervals.current[type] = undefined;
      }
      if (decayDebounce.current[type]) {
        clearTimeout(decayDebounce.current[type]);
      }
      decayDebounce.current[type] = setTimeout(() => {
        startDecay(type);
      }, 500);
    },
    [startDecay],
  );

  const formatReactionCount = (count: number) => (count > 99 ? '99+' : count);
  const isGrid = layout === 'grid-2';
  const total = reactions.length;
  const containerClass = isGrid
    ? `grid grid-cols-2 gap-2 justify-items-center ${className ?? ''}`
    : `flex gap-2 ${showLabel ? 'flex-wrap' : 'flex-nowrap justify-center overflow-hidden'} ${className ?? ''}`;

  const handleToggle = (type: ReactionType) => {
    // 클릭할 때마다 confetti 효과 트리거
    setConfettiTriggers((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));
    startShakeWindow(type);
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

        const shakeLevel = shakeIntensities[reaction.type] || 0;

        return (
          <button
            key={reaction.type}
            onClick={() => handleToggle(reaction.type)}
            className={`${baseBtn} ${buttonClassName ?? ''} ${
              isLastOdd ? 'col-span-2 justify-self-start' : ''
            } bg-gray-200 border-gray-400 text-black hover:border-gray-600 active:bg-gray-900 active:border-main-variant1 active:text-main-variant2 active:text-body-m-bold relative ${shakeLevel > 0 ? 'animate-reaction-shake' : ''}`}
            style={shakeLevel > 0 ? ({ '--shake': shakeLevel } as React.CSSProperties) : undefined}
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
                <span className="tabular-nums min-w-4">
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
