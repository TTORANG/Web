/**
 * 대본 수정 기록 아이템
 */
export interface History {
  id: string;
  timestamp: string;
  content: string;
}

/**
 * 리액션 타입
 */
export type ReactionType = 'fire' | 'sleepy' | 'good' | 'bad' | 'confused';

/**
 * 이모지 반응 정보
 */
export interface Reaction {
  type: ReactionType;
  count: number;
  active?: boolean;
}
