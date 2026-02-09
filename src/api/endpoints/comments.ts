/**
 * @file comments.ts
 * @description 댓글 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type {
  CreateCommentRequestDto,
  CreateCommentResponseDto,
  CreateReplyCommentRequestDto,
  CreateReplyCommentResponseDto,
  DeleteCommentRequestDto,
  DeleteCommentResponseDto,
  GetReplyListResponseDto,
  GetSlideCommentsResponseDto,
  UpdateCommentResponseDto,
} from '@/api/dto';
import type { ApiResponse } from '@/types/api';

/**
 * 슬라이드 댓글 목록 조회
 *
 * @param slideId - 슬라이드 ID
 * @param page - 페이지 번호 (기본값: 1)
 * @param limit - 페이지당 개수 (기본값: 20)
 * @returns 댓글 목록 및 페이지네이션 정보
 */
export async function getSlideComments(
  slideId: string,
  page = 1,
  limit = 20,
): Promise<GetSlideCommentsResponseDto> {
  const response = await apiClient.get<ApiResponse<GetSlideCommentsResponseDto>>(
    `/slides/${slideId}/comments`,
    {
      params: { page, limit },
    },
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 슬라이드에 댓글 작성
 *
 * @param slideId - 슬라이드 ID
 * @param data - 댓글 내용
 * @returns 생성된 댓글 정보
 */
export async function createSlideComment(
  slideId: string,
  data: CreateCommentRequestDto,
): Promise<CreateCommentResponseDto> {
  const response = await apiClient.post<ApiResponse<CreateCommentResponseDto>>(
    `/slides/${slideId}/comments`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 댓글에 답글 작성
 *
 * @param commentId - 부모 댓글 ID
 * @param data - 답글 내용
 * @returns 생성된 답글 정보
 */
export async function createReply(
  commentId: string,
  data: CreateReplyCommentRequestDto,
): Promise<CreateReplyCommentResponseDto> {
  const response = await apiClient.post<ApiResponse<CreateReplyCommentResponseDto>>(
    `/comments/${commentId}/replies`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 댓글의 답글 목록 조회
 *
 * @param commentId - 댓글 ID
 * @returns 답글 목록
 */
export async function getReplies(
  commentId: string,
  page = 1,
  limit = 20,
): Promise<GetReplyListResponseDto> {
  const response = await apiClient.get<ApiResponse<GetReplyListResponseDto>>(
    `/comments/${commentId}/replies`,
    {
      params: { page, limit },
    },
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 댓글 수정
 *
 * @param commentId - 댓글 ID
 * @param data - 수정할 내용
 * @returns 수정된 댓글 정보
 */
export async function updateComment(
  commentId: string,
  data: { content: string },
): Promise<UpdateCommentResponseDto> {
  const response = await apiClient.patch<ApiResponse<UpdateCommentResponseDto>>(
    `/comments/${commentId}`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 댓글 삭제
 *
 * @param data - 삭제 대상 정보
 * @returns 삭제 결과
 */
export async function deleteComment(
  data: DeleteCommentRequestDto,
): Promise<DeleteCommentResponseDto> {
  const response = await apiClient.delete<ApiResponse<DeleteCommentResponseDto>>(
    `/comments/${data.commentId}`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}
