export interface Comment {
  id: string;
  /** API 의견 ID (피드백 화면에서 prefixed id를 쓰는 경우 원본 ID) */
  serverId?: string;
  /** 의견이 속한 슬라이드 ID (피드백 화면에서 필요) */
  slideId?: string;
  authorId: string;
  content: string;
  timestamp: string;
  /** true면 삭제/수정 가능 (본인 작성) */
  isMine: boolean;
  /** 참조 정보 - 답글은 없음 */
  ref?: { kind: 'slide'; index: number } | { kind: 'video'; seconds: number };
  slideRef?: string;
  /** 답글 여부 */
  isReply?: boolean;
  /** 부모 댓글 ID - 플랫 구조에서 답글 관계 표현 */
  parentId?: string;
  /** 자식 댓글 목록 - 중첩 구조에서 답글 관계 표현 */
  replies?: Comment[];
}

/**
 * 새 댓글 생성 시 필요한 최소 정보
 */
export interface CreateCommentInput {
  content: string;
  authorId?: string;
  ref?: Comment['ref'];
  parentId?: string;
}
