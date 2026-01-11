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
 * 의견(댓글) 아이템
 *
 * 슬라이드 대본에 대한 팀원들의 의견을 나타냅니다.
 * 답글은 `isReply: true`와 `parentId`로 구분되며, 부모 의견 바로 다음에 표시됩니다.
 */
export interface OpinionItem {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  /** true면 삭제 가능 */
  isMine: boolean;
  /** @default false */
  isReply?: boolean;
  /** isReply일 때만 존재, 부모 삭제 시 연쇄 삭제 */
  parentId?: string;
}

/**
 * 이모지 반응 정보
 */
export interface EmojiReaction {
  emoji: string;
  /** 99 초과 시 "99+"로 표시 */
  count: number;
}
