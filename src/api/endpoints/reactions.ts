import { apiClient } from '@/api';
import type { ApiResponse } from '@/types/api';
import type { Reaction, ReactionType } from '@/types/script';

export interface ToggleReactionRequest {
  type: ReactionType;
}

export const toggleReaction = async (slideId: string, data: ToggleReactionRequest) => {
  const { data: response } = await apiClient.post<Reaction[]>(
    `/slides/${slideId}/reactions/toggle`,
    data,
  );
  return response;
};

export type ReactionSummary = {
  slideId: string;
  reactions: Partial<Record<ReactionType, number>>;
};

export async function getSlideReactionSummary(slideId: string): Promise<ReactionSummary> {
  const response = await apiClient.get<ApiResponse<ReactionSummary>>(
    `/slides/${slideId}/reactions/summary`,
  );

  if (response.data.resultType === 'FAILURE') {
    const reason = response.data.reason;
    let errorMessage = '슬라이드 리액션 집계 조회에 실패했습니다.';

    if (typeof reason === 'string') {
      errorMessage = reason;
    } else if (reason && typeof reason === 'object') {
      errorMessage = reason.message || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (!response.data.success) {
    throw new Error('데이터가 존재하지 않습니다.');
  }

  return response.data.success;
}
