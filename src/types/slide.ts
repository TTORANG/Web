import type { CommentItem } from './comment';
import type { EmojiReaction, HistoryItem } from './script';

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
  opinions: CommentItem[];
  /** 최신순 정렬 */
  history: HistoryItem[];
  emojiReactions: EmojiReaction[];
  viewerText?: string; // 슬라이드 화면 중앙에 뜨는 텍스트
  body?: string; // 하단 설명 박스에 뜨는 텍스트
}
