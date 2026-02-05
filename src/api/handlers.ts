import type { AxiosResponse } from 'axios';

/**
 * API 응답 표준 형식
 */
export interface ApiResponse<T> {
  resultType: 'SUCCESS' | 'FAILURE';
  error: {
    errorCode: string;
    reason: string;
  } | null;
  success: T;
}

/**
 * API 응답 unwrap 헬퍼 함수
 *
 * SUCCESS인 경우 success 데이터를 반환
 * FAILURE인 경우 에러를 throw
 *
 * @example
 * ```typescript
 * const response = await apiClient.get<ApiResponse<User>>('/users/me');
 * const user = unwrapApiResponse(response);
 * ```
 */
export function unwrapApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  const error = response.data.error;
  const errorMessage = error?.reason || '알 수 없는 오류가 발생했습니다.';

  throw new Error(errorMessage);
}

/**
 * 에러 응답 생성 헬퍼 (MSW 핸들러용)
 */
export function createErrorResponse(errorCode: string, reason: string): ApiResponse<null> {
  return {
    resultType: 'FAILURE',
    error: { errorCode, reason },
    success: null,
  };
}

/**
 * 성공 응답 생성 헬퍼 (MSW 핸들러용)
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    resultType: 'SUCCESS',
    error: null,
    success: data,
  };
}
