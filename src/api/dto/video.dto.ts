import type { ReactionType } from '@/types/script';

// ============================================================================
// 영상 녹화 관련 DTO
// ============================================================================

/**
 * 영상 녹화 시작 요청 DTO
 */
export interface StartVideoRequestDto {
  projectId: number;
  title: string;
}

/**
 * 영상 녹화 시작 응답 DTO (success 데이터)
 */
export interface StartVideoResponseDto {
  videoId: string;
}

/**
 * 영상 녹화 완료 요청 DTO
 */
export interface FinishVideoRequestDto {
  slideLogs: Array<{
    slideId: number;
    timestampMs: number;
  }>;
}

/**
 * 영상 녹화 완료 응답 DTO (success 데이터)
 */
export interface FinishVideoResponseDto {
  videoId: string;
  status: string;
  slideCount: number;
  slideDurations: Array<{
    slideId: string;
    totalDurationMs: number;
  }>;
}

/**
 * 청크 업로드 응답 DTO (success 데이터)
 */
export interface ChunkUploadResponseDto {
  ok: boolean;
}

// ============================================================================
// 영상 상세 조회 DTO — GET /videos/:videoId
// ============================================================================

export type VideoStatus = 'processing' | 'ready' | 'failed';

/**
 * 영상 상세 정보
 */
export interface VideoDetailDto {
  videoId: string;
  title: string;
  status: VideoStatus;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  hlsMasterUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

/**
 * 타임라인 리액션 항목
 */
export interface VideoTimelineReactionDto {
  timestampMs: number;
  emojiType: ReactionType;
  count: number;
}

/**
 * 타임라인 댓글 작성자
 */
export interface VideoTimelineCommentUserDto {
  userId: string;
  name: string;
}

/**
 * 타임라인 댓글 항목
 */
export interface VideoTimelineCommentDto {
  commentId: string;
  timestampMs: number;
  content: string;
  createdAt: string;
  user: VideoTimelineCommentUserDto;
}

/**
 * 영상 타임라인 (리액션 + 댓글)
 */
export interface VideoTimelineDto {
  reactions: VideoTimelineReactionDto[];
  comments: VideoTimelineCommentDto[];
}

/**
 * GET /videos/:videoId 응답 DTO
 */
export interface GetVideoDetailResponseDto {
  video: VideoDetailDto;
  timeline: VideoTimelineDto;
}

// ============================================================================
// 영상 목록 조회 DTO — GET /presentations/:projectId/videos
// ============================================================================

/**
 * 영상 목록 항목
 */
export interface VideoListItemDto {
  videoId: string;
  title: string;
  status: VideoStatus;
  durationSeconds: number;
  thumbnailUrl: string | null;
  createdAt: string;
}

/**
 * GET /presentations/:projectId/videos 응답 DTO
 */
export interface GetProjectVideosResponseDto {
  videos: VideoListItemDto[];
}

// ============================================================================
// 영상-슬라이드 타임라인 DTO — GET /videos/:videoId/slides
// ============================================================================

/**
 * 영상-슬라이드 타임라인 항목
 */
export interface VideoSlideTimelineItemDto {
  slideId: string;
  timestampMs: number;
}

/**
 * GET /videos/:videoId/slides 응답 DTO
 */
export interface GetVideoSlidesResponseDto {
  slides: VideoSlideTimelineItemDto[];
}
