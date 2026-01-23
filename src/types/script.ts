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
 * 리액션 타입 배열 (UI 렌더링용)
 */
export const REACTION_TYPES: ReactionType[] = ['fire', 'sleepy', 'good', 'bad', 'confused'];

/**
 * 이모지 반응 정보
 */
export interface Reaction {
  type: ReactionType;
  count: number;
  active?: boolean;
}

/**
 * 타임스탬프 +- 구간 리액션버튼
 * → "언제(at 초)에 눌렸는가"만 저장
 */
export interface ReactionEvent {
  type: ReactionType;
  at: number; // 영상 재생 시간 (초, 소수 가능)
  userId?: string;
}

/**
 * UI에 내려줄 리액션 결과
 */
export interface EmojiReaction {
  type: ReactionType;
  count: number;
  active?: boolean; // 현재 유저가 window 안에서 눌렀는지 (선택)
}
