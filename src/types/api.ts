/**
 * @file api.ts
 * @description API 응답 공통 타입
 */

// ============================================================================
// Common API Types
// ============================================================================

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
 *
 * @example
 * // SUCCESS 케이스
 * if (response.resultType === 'SUCCESS') {
 *   console.log(response.success); // TSuccess 타입
 * }
 *
 * // FAILURE 케이스
 * if (response.resultType === 'FAILURE') {
 *   console.log(response.error.errorCode); // ApiError 타입
 * }
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

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  name: string;
}

// ============================================================================
// Video Types
// ============================================================================

/**
 * 영상 상태
 */
export type VideoStatus = 'recording' | 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted';

/**
 * 영상 정보
 */
export interface Video {
  id: string;
  title: string;
  status: VideoStatus;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  hlsMasterUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

/**
 * 영상 슬라이드 타임라인
 */
export interface VideoSlideTimeline {
  slideId: string;
  timestampMs: number;
}

/**
 * 리액션 이모지 타입
 */
export type EmojiType = 'thumbs_up' | 'thumbs_down' | 'heart' | 'laugh' | 'surprised' | 'thinking';

/**
 * 영상 타임스탬프 리액션
 */
export interface VideoReaction {
  timestampMs: number;
  emojiType: EmojiType;
  count: number;
}

/**
 * 영상 타임스탬프 댓글
 */
export interface VideoComment {
  id: string;
  content: string;
  timestampMs: number;
  createdAt?: string;
  user?: User;
}

/**
 * 영상 타임라인 (리액션 + 댓글)
 */
export interface VideoTimeline {
  reactions: VideoReaction[];
  comments: VideoComment[];
}

// ============================================================================
// Video API Requests
// ============================================================================

/**
 * 영상 생성 요청
 */
export interface CreateVideoRequest {
  projectId: number;
  title: string;
}

/**
 * 녹화 종료 및 영상 처리 요청
 */
export interface FinishRecordingRequest {
  slideLogs: Array<{
    slideId: number;
    timestampMs: number;
  }>;
}

/**
 * 영상 타임스탬프 리액션 생성/토글 요청
 */
export interface ToggleVideoReactionRequest {
  emojiType: EmojiType;
  timestampMs: number;
}

/**
 * 영상 타임스탬프 댓글 생성 요청
 */
export interface CreateVideoCommentRequest {
  content: string;
  timestampMs: number;
}

// ============================================================================
// Video API Responses
// ============================================================================

/**
 * 영상 상세 조회 응답 (복잡한 구조이므로 타입 분리)
 */
export interface GetVideoDetailResponse {
  video: Video;
  timeline: VideoTimeline;
}

// ============================================================================
// Script Types
// ============================================================================

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
