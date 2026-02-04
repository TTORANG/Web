/**
 * @file reactions.ts
 * @description 슬라이드 리액션 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type { ToggleSlideReactionDto } from '@/api/dto';
import type { ApiResponse } from '@/types/api';
import type { Reaction } from '@/types/script';

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

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}
