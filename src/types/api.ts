/**
 * @file api.ts
 * @description API 응답 공통 타입
 */

/**
 * API 에러 정보
 */
export interface ApiError<TErrorData = unknown> {
  errorCode: string;
  reason: string;
  data?: TErrorData;
}

/**
 * API 응답 래퍼 (Discriminated Union)
 */
export type ApiResponse<TSuccess, TErrorData = unknown> =
  | {
      resultType: 'SUCCESS';
      error: null;
      success: TSuccess;
    }
  | {
      resultType: 'FAILURE';
      error: ApiError<TErrorData>;
      success: null;
    };

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

/**
 * 변환 상태
 */
export type ConversionStatus = 'processing' | 'completed' | 'failed';

/**
 * 변환 진행 상황
 */
export interface ConversionProgress {
  slides: {
    total: number;
    generated: number;
  };
  thumbnail: ConversionStatus;
  metadata: ConversionStatus;
}

/**
 * 변환 상태 응답
 */
export interface ConversionStatusResponse {
  status: ConversionStatus;
  progress: ConversionProgress;
}
