/**
 * 대본 수정 기록 아이템
 *
 * @see {@link ../stores/slideStore.ts#saveToHistory} 히스토리 저장
 * @see {@link ../stores/slideStore.ts#restoreFromHistory} 히스토리 복원
 */
export interface HistoryItem {
  /** 기록 ID (UUID) */
  id: string;
  /** 수정 시각 (MM월 DD일 HH:mm) */
  timestamp: string;
  /** 당시 대본 내용 */
  content: string;
}

/**
 * 의견(댓글) 아이템
 *
 * @see {@link ../stores/slideStore.ts#deleteOpinion} 의견 삭제
 * @see {@link ../stores/slideStore.ts#addReply} 답글 추가
 * @see {@link ../components/slide/script/Opinion.tsx} UI 컴포넌트
 */
export interface OpinionItem {
  /** 의견 ID */
  id: number;
  /** 작성자 이름 */
  author: string;
  /** 의견 내용 */
  content: string;
  /** 작성 시각 */
  timestamp: string;
  /** 내 의견 여부 */
  isMine: boolean;
  /** 답글 여부 */
  isReply?: boolean;
  /** 부모 의견 ID (답글인 경우) */
  parentId?: number;
}

/**
 * 이모지 반응 정보
 *
 * @see {@link ../components/slide/script/ScriptBoxEmoji.tsx} UI 컴포넌트
 */
export interface EmojiReaction {
  /** 이모지 캐릭터 */
  emoji: string;
  /** 반응 횟수 */
  count: number;
}
