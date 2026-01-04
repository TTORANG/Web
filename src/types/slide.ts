import type { EmojiReaction, HistoryItem, OpinionItem } from './script';

/**
 * 슬라이드 데이터 모델
 */
export interface Slide {
  /** 슬라이드 고유 ID */
  id: string;
  /** 슬라이드 제목 */
  title: string;
  /** 썸네일 이미지 URL */
  thumb: string;
  /** 슬라이드 대본 */
  script: string;
  /** 의견 목록 */
  opinions: OpinionItem[];
  /** 대본 수정 기록 */
  history: HistoryItem[];
  /** 이모지 반응 목록 */
  emojiReactions: EmojiReaction[];
}
