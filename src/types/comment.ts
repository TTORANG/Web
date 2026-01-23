// 슬라이드/영상 이동을 "한 개의 핸들러"로 처리하기 위한 ref 타입
export type CommentRef = { kind: 'video'; seconds: number } | { kind: 'slide'; ref: string };

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  /** true면 삭제/수정 가능 (본인 작성) */
  isMine: boolean;
  /** 슬라이드 참조 (예: "슬라이드 3") - 피드백 화면용 */
  slideRef?: string;
  /** 영상 타임스탬프 참조 (초 단위) - 영상 피드백용 */
  videoSecondsRef?: number;
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
  slideRef?: string;
  videoSecondsRef?: number;
  parentId?: string;
}
