export interface VideoDto {
  videoId: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  durationSeconds: number;
  rootCommentCount: number;
  replyCount: number;
  reactionCount: number;
  viewCount: number;
  thumbnailUrl: string;
  createdAt: string;
}

/**
 * 영상 타임스탬프 댓글 생성
 */
export interface CreateCommentDto {
  content: string;

  /** 답글인 경우 부모 댓글 ID */
  parentId?: string;
}

/**
 * 영상 녹화 세션 생성 요청 DTO
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
 * 청크 업로드 응답 DTO (success 데이터)
 */
export interface ChunkUploadResponseDto {
  ok: boolean;
}

/**
 * 녹화 종료 및 영상 처리 시작 요청 DTO
 */
export interface FinishVideoRequestDto {
  slideLogs: Array<{
    slideId: number;
    timestampMs: number;
  }>;
}

/**
 * 녹화 종료 및 영상 처리 시작 응답 DTO (success 데이터)
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
 * 프로젝트별 영상 목록 조회 응답 DTO
 * GET /presentations/:projectId/videos
 */
export interface GetProjectVideosResponseDto {
  videos: VideoDto[];
  total: number;
}
