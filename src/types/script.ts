/**
 * 리액션 타입
 *
 * TODO: 백엔드 emojiType 확정 후 값 변경 필요 (현재 임시 값)
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
