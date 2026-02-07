/**
 * @file videoReactions.ts
 * @description 영상 리액션 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type {
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
