/**
 * @file videoReactions.ts
 * @description 영상 리액션 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type {
  ReadVideoReactionSummaryItemDto,
  ReadVideoReactionTimelineResponseDto,
  ToggleVideoReactionDto,
  ToggleVideoReactionResponseDto,
} from '@/api/dto/reactions.dto';
import type { ApiResponse } from '@/types/api';

export type { ToggleVideoReactionDto as ToggleVideoReactionRequest };

/**
 * 영상 리액션 토글
 *
 * @param videoId - 영상 ID
 * @param data - 리액션 데이터 (type + timestamp)
 * @returns { active: boolean } - 토글 후 활성 상태
 */
export async function toggleVideoReaction(
  videoId: string,
  data: ToggleVideoReactionDto,
): Promise<ToggleVideoReactionResponseDto> {
  const { data: response } = await apiClient.post<ApiResponse<ToggleVideoReactionResponseDto>>(
    `/videos/${videoId}/reactions`,
    data,
  );

  if (response.resultType === 'SUCCESS') {
    return response.success;
  }
  throw new Error(response.error.reason);
}

/**
 * 영상 리액션 (특정 시점) 조회
 *
 * @param videoId - 영상 ID
 * @param params - timestampMs (필수), windowMs (선택)
 * @returns 이모지 타입별 집계 배열
 */
export async function getVideoReactions(
  videoId: string,
  params: { timestampMs: number; windowMs?: number },
): Promise<ReadVideoReactionSummaryItemDto[]> {
  const { data } = await apiClient.get<ApiResponse<ReadVideoReactionSummaryItemDto[]>>(
    `/videos/${videoId}/reactions`,
    { params },
  );

  if (data.resultType === 'SUCCESS') {
    return data.success;
  }
  throw new Error(data.error.reason);
}

/**
 * 영상 리액션 타임라인 조회
 *
 * @param videoId - 영상 ID
 * @param params - intervalMs (선택)
 * @returns 타임라인 마커
 */
export async function getVideoReactionTimeline(
  videoId: string,
  params?: { intervalMs?: number },
): Promise<ReadVideoReactionTimelineResponseDto> {
  const { data } = await apiClient.get<ApiResponse<ReadVideoReactionTimelineResponseDto>>(
    `/videos/${videoId}/reactions/timeline`,
    { params },
  );

  if (data.resultType === 'SUCCESS') {
    return data.success;
  }
  throw new Error(data.error.reason);
}
