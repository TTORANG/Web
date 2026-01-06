/**
 * @file client.ts
 * @description Axios 인스턴스 설정 및 인터셉터 구성
 *
 * 이 파일에서는 전역 API 클라이언트를 설정합니다.
 * - baseURL, timeout 등 기본 설정
 * - 인증 토큰 자동 삽입 (Request Interceptor)
 * - 전역 에러 핸들링 및 하이브리드 전략 적용 (Response Interceptor)
 */
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { handleApiError } from '@/api/errorHandler';
import { useAuthStore } from '@/stores/authStore';

/**
 * API 관련 상수
 */
export const API_TIMEOUT_MS = 10000;

/**
 * API 에러 응답 타입
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Axios 인스턴스 생성
 * 모든 API 요청은 이 인스턴스를 통해 이루어집니다.
 */
export const apiClient = axios.create({
  // 기본 URL - 환경 변수 또는 로컬 호스트 사용
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',

  // 타임아웃 설정
  timeout: API_TIMEOUT_MS,

  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * 서버로 요청을 보내기 전에 실행됩니다.
 * Zustand 스토어에서 인증 토큰을 가져와 헤더에 추가합니다.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * 응답 인터셉터
 * 서버로부터 응답을 받은 후 실행됩니다.
 *
 * 하이브리드 에러 핸들링 전략:
 * - 401, 500+: Axios 인터셉터에서 즉시 처리 (시스템 에러)
 * - 400, 403, 404: TanStack Query 전역 핸들러에서 처리 (비즈니스 에러)
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '알 수 없는 오류가 발생했습니다';

    // [하이브리드 전략]
    // 시스템 에러 (401 인증, 500 서버 장애)는 Axios가 즉시 처리하여 UX를 보호합니다.
    if (status === 401 || (status && status >= 500)) {
      handleApiError(status, message);
    }

    return Promise.reject(error);
  },
);
