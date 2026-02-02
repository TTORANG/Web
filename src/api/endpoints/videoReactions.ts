import { apiClient } from '@/api';
import type { Reaction, ReactionType } from '@/types/script';

export interface ToggleVideoReactionRequest {
  type: ReactionType;
  timestamp: number;
}

export interface ToggleVideoReactionResponse {
  timestamp: number;
  reactions: Reaction[];
}

export const toggleVideoReaction = async (videoId: string, data: ToggleVideoReactionRequest) => {
  const { data: response } = await apiClient.post<ToggleVideoReactionResponse>(
    `/videos/${videoId}/reactions`,
    data,
  );
  return response;
};
