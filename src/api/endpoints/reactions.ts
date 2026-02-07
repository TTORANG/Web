/**
 * @file reactions.ts * @description Slide reaction APIs.
 */
import { apiClient } from '@/api';
import type { ToggleSlideReactionDto } from '@/api/dto';
import type { ReactionCountDto } from '@/api/dto/reactions.dto';
import type { ApiResponse } from '@/api/handlers';
import type { Reaction } from '@/types/script';

/**
 * Toggle a reaction for a slide.
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
  const { data: response } = await apiClient.post<ApiResponse<Reaction[]>>(
    `/slides/${slideId}/reactions/toggle`,
    data,
  );
  return response.success;
}

/**
 * Get reaction summary counts for a slide.
 */
export async function getSlideReactionSummary(slideId: string) {
  const { data } = await apiClient.get<ApiResponse<ReactionCountDto>>(
    `/slides/${slideId}/reactions/summary`,
  );

  // ⚠️ 핵심: success 안에 있는 reactions 객체만 리턴! (없으면 빈 객체)
  return data.success?.reactions ?? {};
}
