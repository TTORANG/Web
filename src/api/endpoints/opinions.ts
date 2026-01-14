/**
 * @file opinions.ts
 * @description 의견(댓글) 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type { CommentItem } from '@/types/comment';

/**
 * 의견 생성 요청 타입
 */
export interface CreateOpinionRequest {
  content: string;
  /** 답글인 경우 부모 의견 ID */
  parentId?: string;
}

/**
 * 의견 추가
 *
 * @param slideId - 슬라이드 ID
 * @param data - 의견 데이터
 * @returns 생성된 의견
 */
export async function createOpinion(
  slideId: string,
  data: CreateOpinionRequest,
): Promise<CommentItem> {
  const response = await apiClient.post<CommentItem>(`/slides/${slideId}/opinions`, data);
  return response.data;
}

/**
 * 의견 삭제
 *
 * @param opinionId - 삭제할 의견 ID
 */
export async function deleteOpinion(opinionId: string): Promise<void> {
  await apiClient.delete(`/opinions/${opinionId}`);
}
