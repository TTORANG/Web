import { apiClient } from '@/api';
import type { EmojiReaction, ReactionType } from '@/types/script';

export interface ToggleReactionRequest {
  type: ReactionType;
}

export const toggleReaction = async (slideId: string, data: ToggleReactionRequest) => {
  const { data: response } = await apiClient.post<EmojiReaction[]>(
    `/slides/${slideId}/reactions`,
    data,
  );
  return response;
};
