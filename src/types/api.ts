/**
 * @file api.ts
 * @description API 응답 공통 타입
 */

/**
 * API 응답 래퍼
 */
export type ApiResponse<T, D = unknown> =
  | {
      resultType: 'SUCCESS';
      error: null;
      success: T;
    }
  | {
      resultType: 'FAILURE';
      error: ApiError<D>;
      success: null;
    };

/**
 * API 에러 정보
 */
export interface ApiError<D = unknown> {
  errorCode: string;
  reason: string;
  data?: D;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 대본 정보 응답
 */
export interface ScriptResponse {
  message?: string;
  slideId: string;
  charCount: number;
  scriptText: string;
  estimatedDurationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 대본 버전 (히스토리) 정보
 */
export interface ScriptVersion {
  versionNumber: number;
  scriptText: string;
  charCount: number;
  createdAt: string;
}
