/**
 * @file client.ts
 * @description Axios 인스턴스 설정
 *
 * axios는 HTTP 요청을 보내는 라이브러리입니다.
 * fetch보다 편리한 점:
 * - 자동 JSON 변환
 * - 요청/응답 인터셉터 (모든 요청에 공통 로직 적용)
 * - 타임아웃 설정
 * - 에러 핸들링
 */
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { handleApiError } from '@/api/errorHandler';
import { useAuthStore } from '@/stores/authStore';

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
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
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
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '알 수 없는 오류가 발생했습니다';

    // 전역 에러 핸들러 호출
    handleApiError(status, message);

    return Promise.reject(error);
  },
);

/**
 * 사용 예시:
 *
 * // GET 요청
 * const response = await apiClient.get('/slides');
 * const slides = response.data;
 *
 * // POST 요청 (데이터 전송)
 * const response = await apiClient.post('/slides', { title: '새 슬라이드' });
 *
 * // PUT 요청 (수정)
 * await apiClient.put('/slides/1', { title: '수정된 제목' });
 *
 * // DELETE 요청
 * await apiClient.delete('/slides/1');
 */
