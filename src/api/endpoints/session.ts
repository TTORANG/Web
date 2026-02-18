import axios from 'axios';

import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse } from '@/types';
import { userFromAccessToken } from '@/utils/auth';

import { apiClient } from '../client';
import type { SocialLoginSuccessResponseDto } from '../dto';
import type {
  CreateAnonymousSessionResponseDto,
  MergeSessionRequestDto,
  MergeSessionResponseDto,
} from '../dto/session.dto';

export const sessionApi = {
  // POST /session/anonymous - 익명 세션 생성
  createAnonymousSession: async () => {
    const response =
      await apiClient.post<ApiResponse<CreateAnonymousSessionResponseDto>>('/session/anonymous');

    const data = response.data;

    // 성공이면 토큰을 전역 store에 저장해서 이후 요청에 authorization 붙게 함
    if (data.resultType === 'SUCCESS') {
      const { sessionId, accessToken, refreshToken } = data.success;

      const user = userFromAccessToken(accessToken, sessionId);

      useAuthStore.getState().anonymous(sessionId, accessToken, refreshToken, user);
    }

    return data;
  },

  // POST /session/merge - 익명 세션 병합
  mergeSession: async (payload: MergeSessionRequestDto) => {
    const response = await apiClient.post<ApiResponse<MergeSessionResponseDto>>(
      '/session/merge',
      payload,
    );
    return response.data;
  },

  // POST /auth/reissue - 토큰 재발급
  // 의도적으로 raw axios 사용: refresh token이 쿠키로 전송되므로 Authorization 헤더 불필요.
  // apiClient를 사용하면 response interceptor가 401 재발급을 재귀 호출하므로 반드시 우회해야 함.
  reissueToken: async () => {
    const response = await axios.post<ApiResponse<SocialLoginSuccessResponseDto>>(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/reissue`,
      {},
      { withCredentials: true, timeout: 10000 },
    );
    return response.data;
  },
};
