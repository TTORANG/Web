/**
 * @file reactions.ts
 * @description 슬라이드 리액션 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type { ApiResponse } from '@/types/api';
import type { Reaction, ReactionType } from '@/types/script';
import type { ToggleSlideReactionDto } from '@/api/dto';

/**
 * 리액션 토글 요청 타입 (하위 호환성)
 * @deprecated ToggleSlideReactionDto 사용 권장
 */
export type ToggleReactionRequest = ToggleSlideReactionDto;

/**
 * 슬라이드 리액션 토글
 *
 * @param slideId - 슬라이드 ID
 * @param data - 리액션 데이터
 * @returns 업데이트된 리액션 배열
 */
export async function toggleReaction(
  slideId: string,
  data: ToggleSlideReactionDto,
): Promise<Reaction[]> {
  const response = await apiClient.post<ApiResponse<Reaction[]>>(
    `/slides/${slideId}/reactions`,
    data,
  );

export const toggleReaction = async (slideId: string, data: ToggleReactionRequest) => {
  const { data: response } = await apiClient.post<Reaction[]>(
    `/slides/${slideId}/reactions/toggle`,
    data,
  );
  return response;
};

export type ReactionSummary = {
  slideId: string;
  reactions: Partial<Record<ReactionType, number>>;
};

export async function getSlideReactionSummary(slideId: string): Promise<ReactionSummary> {
  const response = await apiClient.get<ApiResponse<ReactionSummary>>(
    `/slides/${slideId}/reactions/summary`,
  );

  if (response.data.resultType === 'FAILURE') {
    const reason = response.data.reason;
    let errorMessage = '슬라이드 리액션 집계 조회에 실패했습니다.';

    if (typeof reason === 'string') {
      errorMessage = reason;
    } else if (reason && typeof reason === 'object') {
      errorMessage = reason.message || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (!response.data.success) {
    throw new Error('데이터가 존재하지 않습니다.');
  }

  return response.data.success;
}
