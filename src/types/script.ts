/**
 * 대본 수정 기록 아이템
 */
export interface HistoryItem {
  id: string;
  /** @format "M월 D일 HH:mm" */
  timestamp: string;
  content: string;
}

/**
 * 리액션 타입 (5가지 고정)
 */
export type ReactionType = 'fire' | 'sleepy' | 'good' | 'bad' | 'confused';

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
 * 리액션 타입 목록 (순서 보장)
 */
export const REACTION_TYPES: ReactionType[] = ['fire', 'sleepy', 'good', 'bad', 'confused'];

/**
 * 이모지 반응 정보
 */
export interface EmojiReaction {
  type: ReactionType;
  /** 99 초과 시 "99+"로 표시 */
  count: number;
  /** 활성화 여부 (UI용) */
  active?: boolean;
}
