/**
 * @file reactions.ts
 * @description 슬라이드 리액션 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type { ToggleSlideReactionDto } from '@/api/dto';
import type { ReactionCountDto, ToggleSlideReactionResponseDto } from '@/api/dto/reactions.dto';
import type { ApiResponse } from '@/types/api';

/**
 * 슬라이드 리액션 토글
 *
 * @param slideId - 슬라이드 ID
 * @param data - 리액션 데이터
 * @returns { active: boolean } - 토글 후 활성 상태
 */
export async function toggleReaction(
  slideId: string,
  data: ToggleSlideReactionDto,
): Promise<ToggleSlideReactionResponseDto> {
  const { data: response } = await apiClient.post<ApiResponse<ToggleSlideReactionResponseDto>>(
    `/slides/${slideId}/reactions/toggle`,
    data,
  );

  if (response.resultType === 'SUCCESS') {
    return response.success;
  }
  throw new Error(response.error.reason);
}

/**
 * 슬라이드 리액션 집계 조회
 *
 * @param slideId - 슬라이드 ID
 * @returns Record<ReactionType, number> - 이모지별 카운트
 */
export async function getSlideReactionSummary(slideId: string) {
  const { data } = await apiClient.get<ApiResponse<ReactionCountDto>>(
    `/slides/${slideId}/reactions/summary`,
  );

  if (data.resultType === 'SUCCESS') {
    return data.success.reactions;
  }
  throw new Error(data.error.reason);
}
