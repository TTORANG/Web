import type { ReactionType } from '@/types/script';

/**
 * 리액션 설정 (이모지, 라벨 매핑)
 */
export const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string }> = {
  fire: { emoji: '🔥', label: '인상적이에요' },
  sleepy: { emoji: '💤', label: '지루해요' },
  good: { emoji: '👍', label: '잘했어요' },
  bad: { emoji: '👎', label: '별로에요' },
  confused: { emoji: '🤷', label: '이해 안돼요' },
} as const;

/**
 * 리액션 타입 배열 (REACTION_CONFIG 키에서 추출)
 */
export const REACTION_TYPES = Object.keys(REACTION_CONFIG) as ReactionType[];
