import type { Comment } from './comment';
import type { History, Reaction } from './script';

/**
 * 슬라이드 데이터 모델
 *
 * 프레젠테이션의 개별 슬라이드를 나타냅니다.
 * 각 슬라이드는 대본, 의견, 수정 기록, 이모지 반응을 포함합니다.
 */
export interface Slide {
  id: string;
  projectId: string;
  title: string;
  thumb: string;
  script: string;
  opinions: Comment[];
  history: History[];
  emojiReactions: Reaction[];
}
