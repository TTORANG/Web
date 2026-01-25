export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  /** true면 삭제/수정 가능 (본인 작성) */
  isMine: boolean;
  /** 참조 정보 - 답글은 없음 */
  ref?: { kind: 'slide'; index: number } | { kind: 'video'; seconds: number };
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
