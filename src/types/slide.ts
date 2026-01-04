import type { EmojiReaction, HistoryItem, OpinionItem } from './script';

/**
 * 슬라이드 데이터 모델
 *
 * 프레젠테이션의 개별 슬라이드를 나타냅니다.
 * 각 슬라이드는 대본, 의견, 수정 기록, 이모지 반응을 포함합니다.
 */
export interface Slide {
  id: string;
  title: string;
  thumb: string;
  /** 포커스 해제 시 히스토리에 자동 저장 */
  script: string;
  opinions: OpinionItem[];
  /** 최신순 정렬 */
  history: HistoryItem[];
  emojiReactions: EmojiReaction[];
}
