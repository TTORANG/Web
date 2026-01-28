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
  timestamp?: number; // 선택적: 반응의 타임스탬프
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
