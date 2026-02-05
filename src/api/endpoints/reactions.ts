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
 */
export async function toggleReaction(
  slideId: string,
  data: ToggleSlideReactionDto,
): Promise<Reaction[]> {
  const { data: response } = await apiClient.post<Reaction[]>(
    `/slides/${slideId}/reactions/toggle`,
    data,
  );
  return response;
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
