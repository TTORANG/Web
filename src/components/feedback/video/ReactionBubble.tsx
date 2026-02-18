/**
 * @file ReactionBubble.tsx
 * @description 영상 재생바 위에 현재 구간 리액션을 요약하여 보여주는 버블 컴포넌트
 *
 * - 현재 재생시간 ±windowMs 범위 내 리액션을 표시
 * - 상위 3개까지 노출, 4개 이상이면 상위 3개 + "..." 로 축약
 * - "..." 클릭 시 팝오버로 전체 5종 표시
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { REACTION_CONFIG, REACTION_TYPES } from '@/constants/reaction';
import { useVideoReactionWindow } from '@/hooks/queries/useVideoReactionQueries';
import type { ReactionType } from '@/types/script';

interface ReactionBubbleProps {
  videoId: string | undefined;
  currentTimeMs: number;
  windowMs?: number;
}

export default function ReactionBubble({
  videoId,
  currentTimeMs,
  windowMs = 5000,
}: ReactionBubbleProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 500ms 단위로 쿼리 키를 스냅하여 과도한 리패치 방지
  const snappedMs = Math.round(currentTimeMs / 500) * 500;

  const { data: reactions } = useVideoReactionWindow(videoId, snappedMs, windowMs);

  useEffect(() => {
    if (!isPopoverOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isPopoverOpen]);

  const handleTogglePopover = useCallback(() => {
    setIsPopoverOpen((prev) => !prev);
  }, []);

  // 리액션 데이터를 정규화
  const reactionMap = new Map<ReactionType, number>();
  if (reactions) {
    for (const r of reactions) {
      reactionMap.set(r.emojiType, (reactionMap.get(r.emojiType) ?? 0) + r.count);
    }
  }

  // count > 0인 항목만 추출, count 내림차순
  const activeReactions = REACTION_TYPES.map((type) => ({
    type,
    emoji: REACTION_CONFIG[type].emoji,
    count: reactionMap.get(type) ?? 0,
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  if (activeReactions.length === 0) return null;

  const displayItems = activeReactions.slice(0, 3);
  const hasMore = activeReactions.length >= 4;

  // 전체 5종 목록 (팝오버용)
  const allReactions = REACTION_TYPES.map((type) => ({
    type,
    emoji: REACTION_CONFIG[type].emoji,
    label: REACTION_CONFIG[type].label,
    count: reactionMap.get(type) ?? 0,
  }));

  return (
    <div ref={popoverRef} className="relative inline-flex">
      <button
        type="button"
        onClick={hasMore ? handleTogglePopover : undefined}
        className="flex items-center gap-1 md:gap-2 rounded-full bg-black/70 px-2 py-1 md:px-3 md:py-1.5 text-white backdrop-blur-sm text-caption md:text-body-s"
      >
        {displayItems.map((item) => (
          <span key={item.type} className="inline-flex items-center gap-0.5 md:gap-1">
            <span className="text-xs md:text-sm">{item.emoji}</span>
            <span>{item.count}</span>
          </span>
        ))}
        {hasMore && <span className="text-gray-300">···</span>}
      </button>

      {isPopoverOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-40 md:w-52 rounded-lg bg-black/85 p-2 md:p-3 text-white backdrop-blur-sm shadow-lg">
          <p className="mb-1.5 md:mb-2 text-caption-bold md:text-body-s-bold text-gray-300">
            전체 이모지 반응 보기
          </p>
          <div className="flex flex-col gap-1 md:gap-1.5">
            {allReactions.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="flex items-center gap-1 md:gap-1.5">
                  <span className="text-xs md:text-sm">{item.emoji}</span>
                  <span className="text-caption md:text-body-s text-gray-300">{item.label}</span>
                </span>
                <span className="text-caption-bold md:text-body-s-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
