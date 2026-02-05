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
 * 상호 배타적 리액션 그룹
 * 같은 그룹 내에서는 하나만 선택 가능
 */
export const EXCLUSIVE_REACTION_GROUPS: ReactionType[][] = [
  ['fire', 'sleepy'],
  ['good', 'bad'],
];

/**
 * 주어진 리액션 타입의 exclusive 그룹에서 다른 타입 반환
 */
export function getExclusiveCounterpart(type: ReactionType): ReactionType | null {
  for (const group of EXCLUSIVE_REACTION_GROUPS) {
    if (group.includes(type)) {
      return group.find((t) => t !== type) ?? null;
    }
  }
  return null;
}

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
