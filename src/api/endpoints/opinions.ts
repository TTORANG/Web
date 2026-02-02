/**
 * @file opinions.ts
 * @description 의견(댓글) 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type { CreateOpinionDto } from '@/api/dto';
import type { ApiResponse } from '@/types/api';
import type { Comment } from '@/types/comment';

/**
 * 의견 추가
 *
 * @param slideId - 슬라이드 ID
 * @param data - 의견 데이터
 * @returns 생성된 의견
 */
export async function createOpinion(slideId: string, data: CreateOpinionDto): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(`/slides/${slideId}/opinions`, data);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 의견 삭제
 *
 * @param opinionId - 삭제할 의견 ID
 */
export async function deleteOpinion(opinionId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/opinions/${opinionId}`);

  if (response.data.resultType === 'SUCCESS') {
    return;
  }

  throw new Error(response.data.error.reason);
}
