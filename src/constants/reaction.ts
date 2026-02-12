import type { Reaction, ReactionType } from '@/types/script';

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
 * 낙관적 업데이트 잠금 시간 (ms)
 * 서버 응답이 오기 전 낙관적 카운트를 유지하는 기간
 */
export const OPTIMISTIC_LOCK_DURATION = 2000;

/**
 * 리액션 카운트 포맷 (99 초과 시 '99+')
 */
export const formatReactionCount = (count: number): string | number => (count > 99 ? '99+' : count);

/**
 * 리액션 타입 배열 (REACTION_CONFIG 키에서 추출)
 */
export const REACTION_TYPES = Object.keys(REACTION_CONFIG) as ReactionType[];

/**
 * 기본 리액션 상태 생성 (count/active 초기화)
 */
export function createDefaultReactions(): Reaction[] {
  return REACTION_TYPES.map((type) => ({
    type,
    count: 0,
    active: false,
  }));
}
