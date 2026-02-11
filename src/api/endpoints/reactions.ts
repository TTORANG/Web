/**
 * @file reactions.ts
 * @description 슬라이드 리액션 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type { CreateSlideReactionDto } from '@/api/dto';
import type {
  CreateSlideReactionResponseDto,
  ReadReactionCountDto,
  ReadReactionSummaryDto,
} from '@/api/dto/reactions.dto';
import type { ApiResponse } from '@/types/api';

/**
 * 슬라이드 리액션 생성
 *
 * 요청 1회 = 카운트 1 증가 (토글 아님)
 *
 * @param slideId - 슬라이드 ID
 * @param data - 리액션 데이터
 * @returns 생성된 리액션 정보
 */
export async function createReaction(
  slideId: string,
  data: CreateSlideReactionDto,
): Promise<CreateSlideReactionResponseDto> {
  const { data: response } = await apiClient.post<ApiResponse<CreateSlideReactionResponseDto>>(
    `/slides/${slideId}/reactions`,
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
  const { data } = await apiClient.get<ApiResponse<ReadReactionCountDto>>(
    `/slides/${slideId}/reactions/summary`,
  );

  if (data.resultType === 'SUCCESS') {
    return data.success.reactions;
  }
  throw new Error(data.error.reason);
}

/**
 * 프로젝트 전체 슬라이드 리액션 집계 조회
 *
 * @param projectId - 프로젝트 ID
 * @returns ReactionSummaryDto - 이모지별 총 카운트
 */
export async function getTotalReactions(projectId: string): Promise<ReadReactionSummaryDto> {
  const { data } = await apiClient.get<ApiResponse<ReadReactionSummaryDto>>(
    `/presentations/${projectId}/slides/reactions/summary`,
  );

  if (data.resultType === 'SUCCESS') {
    return data.success;
  }
  throw new Error(data.error.reason);
}
