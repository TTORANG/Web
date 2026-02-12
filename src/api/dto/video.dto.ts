import type { ReactionType } from '@/types/script';

// ============================================================================
// 공통 타입
// ============================================================================

export type VideoStatus = 'processing' | 'ready' | 'failed';

// ============================================================================
// 영상 기본 정보 DTO
// ============================================================================

/**
 * 영상 목록 항목 (간략 정보)
 */
export interface VideoListItemDto {
  feedbackCount: number;
  viewCount: number;
  reactionCount: number;
  replyCount: number;
  rootCommentCount: number;
  videoId: string;
  title: string;
  status: VideoStatus;
  durationSeconds: number;
  thumbnailUrl: string | null;
  createdAt: string;
}

/**
 * 영상 상세 정보 (전체 정보)
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

// ============================================================================
// 타임라인 관련 DTO
// ============================================================================

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
  profileImageUrl: unknown;
  userId: string;
  name: string;
}

/**
 * 타임라인 답글 항목
 */
export interface VideoTimelineReplyDto {
  replyId: string;
  content: string;
  createdAt: string;
  user: VideoTimelineCommentUserDto;
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
  replies?: VideoTimelineReplyDto[];
}

/**
 * 영상 타임라인 (리액션 + 댓글)
 */
export interface VideoTimelineDto {
  feedbacks: never[];
  reactions: VideoTimelineReactionDto[];
  comments: VideoTimelineCommentDto[];
}

// ============================================================================
// 댓글 생성 DTO
// ============================================================================

/**
 * 댓글 생성 요청
 * POST /videos/:videoId/comments
 */
export interface CreateCommentRequestDto {
  content: string;
  /** 답글인 경우 부모 댓글 ID */
  parentId?: string;
  /** 타임스탬프 (밀리초 단위, 영상 전용) */
  timestampMs?: number;
}

// ============================================================================
// 영상 녹화 관련 DTO
// ============================================================================

/**
 * 영상 녹화 시작 요청
 * POST /videos/start
 */
export interface CreateStartVideoRequestDto {
  projectId: number;
  title: string;
}

/**
 * 영상 녹화 시작 응답
 */
export interface CreateStartVideoResponseDto {
  videoId: string;
}

/**
 * 청크 업로드 응답
 * POST /videos/:videoId/chunks
 */
export interface CreateChunkUploadResponseDto {
  ok: boolean;
}

/**
 * 녹화 종료 요청
 * POST /videos/:videoId/finish
 */
export interface CreateFinishVideoRequestDto {
  slideLogs: Array<{
    slideId: number;
    timestampMs: number;
  }>;
}

/**
 * 녹화 종료 응답
 */
export interface CreateFinishVideoResponseDto {
  videoId: string;
  status: string;
  slideCount: number;
  slideDurations: Array<{
    slideId: string;
    totalDurationMs: number;
  }>;
}

// ============================================================================
// 영상 목록 조회 (READ) DTO
// ============================================================================

/**
 * 프로젝트별 영상 목록 조회 응답
 * GET /presentations/:projectId/videos
 */
export interface ReadProjectVideosResponseDto {
  videos: VideoListItemDto[];
  total?: number; // 페이지네이션용 (옵션)
}

// ============================================================================
// 영상 상세 조회 (READ) DTO
// ============================================================================

/**
 * 영상 상세 조회 응답
 * GET /videos/:videoId
 */
export interface ReadVideoDetailResponseDto {
  video: VideoDetailDto;
  timeline: VideoTimelineDto;
}

// ============================================================================
// 영상-슬라이드 타임라인 조회 (READ) DTO
// ============================================================================

/**
 * 영상-슬라이드 타임라인 항목
 */
export interface VideoSlideTimelineItemDto {
  slideId: string;
  timestampMs: number;
}

/**
 * 영상-슬라이드 타임라인 조회 응답
 * GET /videos/:videoId/slides
 */
export interface ReadVideoSlidesResponseDto {
  slides: VideoSlideTimelineItemDto[];
}

// ============================================================================
// 영상 수정 (UPDATE) DTO
// ============================================================================

/**
 * 영상 제목 수정 요청
 * PATCH /videos/:videoId
 */
export interface UpdateVideoRequestDto {
  title: string;
}

/**
 * 영상 수정 응답
 */
export interface UpdateVideoResponseDto {
  videoId: string;
  title: string;
}

// ============================================================================
// 영상 삭제 (DELETE) DTO
// ============================================================================

/**
 * 영상 삭제 응답
 * DELETE /videos/:videoId
 */
export interface DeleteVideoResponseDto {
  videoId: string;
  deleted: boolean;
}
