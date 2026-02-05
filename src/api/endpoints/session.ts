import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse } from '@/types';

import { apiClient } from '../client';
import type { CreateAnonymousSessionResponseDto } from '../dto/session.dto';

export const sessionApi = {
  // POST /session/anonymous - 익명 세션 생성
  createAnonymousSession: async () => {
    const response =
      await apiClient.post<ApiResponse<CreateAnonymousSessionResponseDto>>('/session/anonymous');

    const data = response.data;

    // 성공이면 토큰을 전역 store에 저장해서 이후 요청에 authorization 붙게 함
    if (data.resultType === 'SUCCESS') {
      const { accessToken, refreshToken } = data.success;

      useAuthStore.getState().anonymous(accessToken, refreshToken);
    }

    return data;
  },
};
