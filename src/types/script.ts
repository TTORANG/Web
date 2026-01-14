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
 * 이모지 반응 정보
 */
export interface EmojiReaction {
  emoji: string;
  /** 99 초과 시 "99+"로 표시 */
  count: number;
  /** 활성화 여부 (UI용) */
  active?: boolean;
  /** 이모지 라벨 (좋아요, 별로예요 등) */
  label?: string;
}
