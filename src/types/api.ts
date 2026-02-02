/**
 * @file api.ts
 * @description API 응답 공통 타입
 */

/**
 * API 에러 정보
 */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * API 응답 래퍼
 */
export interface ApiResponse<T> {
  resultType: 'SUCCESS' | 'FAILURE';
  reason: ApiError | null;
  success: T;
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

/**
 * 영상 정보 응답
 */
export interface Video {
  videoId: string;
  title: string;
  status: 'recording' | 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted';
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  hlsMasterUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}
