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
 *
 * 이 인스턴스를 통해 모든 API 요청을 보냅니다.
 * 공통 설정이 적용되어 있어서 매번 설정할 필요 없음.
 */
export const apiClient = axios.create({
  // 기본 URL - 모든 요청 앞에 자동으로 붙음
  // 예: apiClient.get('/slides') → GET https://api.example.com/slides
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',

  // 타임아웃 - 10초 안에 응답 없으면 에러
  timeout: 10000,

  // 기본 헤더
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 *
 * 모든 요청이 서버로 가기 전에 실행됩니다.
 * 주로 인증 토큰을 헤더에 추가할 때 사용.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Zustand 스토어에서 토큰 가져오기 (React 외부에서도 getState()로 접근 가능)
    const { accessToken } = useAuthStore.getState();

    // 토큰이 있으면 Authorization 헤더에 추가
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    // 요청 자체가 실패한 경우 (네트워크 문제 등)
    return Promise.reject(error);
  },
);

/**
 * 응답 인터셉터
 *
 * 서버 응답이 도착한 후 실행됩니다.
 * 에러 처리, 토큰 갱신 등에 사용.
 */
apiClient.interceptors.response.use(
  // 성공 응답 (2xx)
  (response) => {
    // response.data만 반환하면 사용할 때 편함
    // 예: const data = await apiClient.get('/slides') → data가 바로 결과
    return response;
  },

  // 에러 응답 (4xx, 5xx)
  (error: AxiosError<ApiError>) => {
    // 401 Unauthorized - 토큰 만료 또는 미인증
    if (error.response?.status === 401) {
      // 스토어의 logout 호출 → 토큰 + 유저 정보 모두 초기화 → UI 즉시 반응
      useAuthStore.getState().logout();

      // 로그인 페이지로 이동 (필요시 주석 해제)
      // window.location.href = '/login';
    }

    // 에러 메시지 추출
    const message =
      error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다';

    // 콘솔에 에러 로그 (개발 중 디버깅용)
    console.error('[API Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message,
    });

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
