/**
 * @file ReactionBubble.tsx
 * @description 영상 재생바 위에 현재 구간 리액션을 요약하여 보여주는 버블 컴포넌트
 *
 * - 현재 재생시간 ±windowMs 범위 내 리액션을 표시
 * - 상위 3개까지 노출, 4개 이상이면 상위 3개 + "..." 로 축약
 * - hover 시 같은 버블이 확장되어 전체 5종 표시
 */
import { useRef, useState } from 'react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // 500ms 단위로 쿼리 키를 스냅하여 과도한 리패치 방지
  const snappedMs = Math.round(currentTimeMs / 500) * 500;

  const { data: reactions } = useVideoReactionWindow(videoId, snappedMs, windowMs);

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
    <div
      ref={bubbleRef}
      onMouseEnter={hasMore ? () => setIsExpanded(true) : undefined}
      onMouseLeave={hasMore ? () => setIsExpanded(false) : undefined}
      className="inline-flex flex-col rounded-2xl bg-[rgba(18,18,20,0.82)] text-[#ffffff] shadow-lg backdrop-blur-sm transition-all duration-150"
    >
      {!isExpanded && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-body-s text-[#ffffff] cursor-default">
          {displayItems.map((item) => (
            <span key={item.type} className="inline-flex items-center gap-1">
              <span className="text-sm">{item.emoji}</span>
              <span>{item.count}</span>
            </span>
          ))}
          {hasMore && <span className="text-[#d1d5db]">···</span>}
        </div>
      )}

      {hasMore && isExpanded && (
        <div className="w-52 p-3">
          <p className="mb-2 text-body-s-bold text-[#d1d5db]">전체 이모지 반응 보기</p>
          <div className="flex flex-col gap-1.5">
            {allReactions.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-body-s text-[#d1d5db]">{item.label}</span>
                </span>
                <span className="text-body-s-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
