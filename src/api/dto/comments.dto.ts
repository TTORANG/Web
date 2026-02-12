/**
 * 댓글 작성자 정보
 */
export interface CommentUserDto {
  userId: string;
  nickName: string;
  profileImageUrl?: string | null;
}

/**
 * 사용자 정보 포함 댓글
 */
export interface CommentWithUserDto {
  commentId: string;
  content: string;
  user: CommentUserDto;
  createdAt: string;
  updatedAt: string;
  /** 서버가 답글 정보를 함께 내려주는 경우 사용 */
  parentId?: string | null;
  /** 서버가 답글 정보를 함께 내려주는 경우 사용 */
  parentCommentId?: string | null;
}

/**
 * 슬라이드 댓글 목록 조회 응답
 */
export interface GetSlideCommentsResponseDto {
  comments: CommentWithUserDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 답글 목록 조회 응답
 */
export interface GetReplyListResponseDto {
  comments: CommentWithUserDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 슬라이드 댓글 생성 요청
 */
export interface CreateCommentRequestDto {
  content: string;
}

/**
 * 슬라이드 댓글 생성 응답
 */
export interface CreateCommentResponseDto {
  commentId: string;
  content: string;
  userId: string;
  createdAt: string;
}

/**
 * 답글 생성 요청
 */
export interface CreateReplyCommentRequestDto {
  content: string;
}

/**
 * 답글 생성 응답
 */
export interface CreateReplyCommentResponseDto {
  parentCommentId: string;
  replyId: string;
  content: string;
  userId: string;
  createdAt: string;
}

/**
 * 댓글/답글 수정 응답
 */
export interface UpdateCommentResponseDto {
  updatedTargetType: 'comment' | 'reply';
  commentId?: string;
  replyId?: string;
  parentCommentId?: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 댓글/답글 삭제 요청
 */
export interface DeleteCommentRequestDto {
  commentId: string;
}

/**
 * 댓글/답글 삭제 응답
 */
export interface DeleteCommentResponseDto {
  deletedTargetType: 'comment' | 'reply';
  commentId?: string;
  replyId?: string;
  parentCommentId?: string;
}

/**
 * 영상 타임스탬프 댓글 생성 요청
 */
export interface CreateVideoCommentRequestDto {
  content: string;
  timestampMs: number;
}
