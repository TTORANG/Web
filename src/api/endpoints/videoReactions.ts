/**
 * @file videoReactions.ts
 * @description Video reaction related APIs.
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
 * Toggle a reaction at a specific video timestamp.
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
 * Read reaction counts around a timestamp window.
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
 * Read video reaction timeline markers.
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
