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
import type { ApiErrorResponse } from '@/types';

/**
 * API 관련 상수
 */
export const API_TIMEOUT_MS = 10000;

/**
 * API FAILURE 응답 구조
 */
export interface ApiFailureResponse {
  resultType: 'FAILURE';
  error: ApiErrorResponse;
  success: null;
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

  // 쿠키 설정
  withCredentials: true,

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

// 토큰 재발급 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * 대기 중인 요청 처리
 */
const processQueue = (error: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

/**
 * 응답 인터셉터
 * 서버로부터 응답을 받은 후 실행됩니다.
 *
 * 하이브리드 에러 핸들링 전략:
 * - 401: 토큰 재발급 시도 후 원래 요청 재시도
 * - 500+: Axios 인터셉터에서 즉시 처리하고 isHandled 플래그 설정
 * - 그 외: TanStack Query 전역 핸들러로 위임
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiFailureResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const errorData = error.response?.data?.error;
    const reason = errorData?.reason || '알 수 없는 오류가 발생했습니다';

    // [401 에러 - 토큰 재발급 로직]
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // 토큰 재발급이 이미 진행 중이면 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // 토큰 재발급 완료 후 원래 요청 재시도
            const { accessToken } = useAuthStore.getState();
            if (accessToken) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // sessionApi를 동적 import로 가져와서 순환 참조 방지
        const { sessionApi } = await import('@/api/endpoints/session');

        // reissue API 호출 (쿠키 기반)
        const response = await sessionApi.reissueToken();

        if (response.resultType === 'SUCCESS') {
          const { tokens } = response.success;
          const { user, refreshToken } = useAuthStore.getState();

          // 새 accessToken 저장 (refreshToken은 쿠키로 관리되므로 기존 값 유지)
          useAuthStore.getState().setAuth({
            user,
            accessToken: tokens.accessToken,
            refreshToken,
          });

          // 대기 중인 요청들 재시도
          processQueue();

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return apiClient(originalRequest);
        } else {
          // reissue 실패
          throw new Error('Token reissue failed');
        }
      } catch (refreshError) {
        // 토큰 재발급 실패 → 로그아웃
        processQueue(refreshError);
        useAuthStore.getState().logout();
        handleApiError(401, '세션이 만료되었습니다. 다시 로그인해주세요.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // [하이브리드 전략]
    // 시스템 에러 (500 서버 장애)는 Axios가 즉시 처리
    if (status && status >= 500) {
      handleApiError(status, reason);
      // 다운스트림(React Query 등)에서 중복 처리하지 않도록 플래그 설정
      error.isHandled = true;
    }

    return Promise.reject(error);
  },
);
