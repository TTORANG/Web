import { apiClient } from '@/api';
import type { Reaction, ReactionType } from '@/types/script';

export interface ToggleReactionRequest {
  type: ReactionType;
}

export const toggleReaction = async (slideId: string, data: ToggleReactionRequest) => {
  const { data: response } = await apiClient.post<Reaction[]>(`/slides/${slideId}/reactions`, data);
  return response;
};
