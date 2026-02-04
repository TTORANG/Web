/**
 * 답글작성
 */
export interface CreateReplyCommentRequestDto {
  commentId: string;
}

/**
 * 답글작성 response DTO
 */
export interface CreateReplyCommentResponseDto {
  id: string;
  content: string;
  parentId: string;
  userId: string;
  createdAt: string;
}

/**
 * 답글 목록 조회 DTO
 */
export interface GetRepliesResponseDto {
  comments: Array<{
    id: string;
    content: string;
    parentId: string | null;
    userId: string;
    createdAt: string;
  }>;
}
/**
 * 슬라이드 댓글 작성
 */
export interface CreateCommentRequestDto {
  slideId: string;
}
/**
 * 슬라이드 댓글 작성 response DTO
 */
export interface CreateCommentResponseDto {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}
/**
 * 댓글 작성자 정보
 */
export interface CommentUserDto {
  id: string;
  nickName: string;
}

/**
 * 사용자 정보 포함 댓글
 */
export interface CommentWithUserDto {
  id: string;
  content: string;
  user: CommentUserDto;
  createdAt: string;
  updatedAt: string;
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
 * 댓글 생성/수정 응답
 */
export interface CommentResponseDto {
  id: string;
  content: string;
  parentId?: string;
  userId: string;
  createdAt: string;
}

/**
 * 답글 목록 조회 응답
 */
export type GetReplyListResponseDto = CommentResponseDto[];
/**
 * 댓글 수정
 */
export interface UpdateCommentResponseDto {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}
/**
 * 댓글 및, 답글 삭제
 */
export interface DeleteCommentRequestDto {
  commentId: string;
}
/**
 * 영상 타임스탬프 댓글 생성
 */
export interface CreateVideoCommentRequestDto {
  content: string;
  timestampMs: number;
}
