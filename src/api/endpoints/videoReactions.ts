import { apiClient } from '@/api';
import type { ApiResponse } from '@/types/api';
import type { ReactionType } from '@/types/script';

/**
 * 비디오 리액션 토글 요청
 * 서버 스펙: POST /videos/{videoId}/reactions
 */
export interface ToggleVideoReactionRequest {
  emojiType: ReactionType;
  timestampMs: number; // 밀리초 단위
}

/**
 * 비디오 리액션 토글 응답
 */
export interface ToggleVideoReactionResponse {
  reactionId: string;
  videoId: number;
  active: boolean;
}

/**
 * 비디오 리액션 토글 (생성/취소)
 *
 * @param videoId - 비디오 ID
 * @param data - 리액션 타입 및 타임스탬프
 * @returns 리액션 토글 결과
 */
export async function toggleVideoReaction(
  videoId: number,
  data: ToggleVideoReactionRequest,
): Promise<ToggleVideoReactionResponse> {
  const response = await apiClient.post<ApiResponse<ToggleVideoReactionResponse>>(
    `/videos/${videoId}/reactions`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}
