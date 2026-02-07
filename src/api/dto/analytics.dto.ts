/**
 * 대본 복원 요청 DTO
 */
export interface RestoreScriptRequestDto {
  version: number;
}

//위 형식대로 response, request dto 작성 부탁드립니다.

/**
 * 슬라이드 내부 Dto
 */
export interface SlideAnalyticsDto {
  slideId: string;
  slideNum: number;
  title: string;
  viewCount: number;
  exitCount: number;
  exitRate: number;
  reactionCount: number;
  commentCount: number;
  feedbackCount: number;
}

/**
 * slides 내 success 내부 Dto
 */
export interface SlideAnalyticsResponseDto {
  slides: SlideAnalyticsDto[];
}

/**
 * 타임라인 내부 Dto
 */
export interface VideoAnalyticsDto {
  timestampMs: number;
  reactionCount: number;
  commentCount: number;
  feedbackCount: number;
}

/**
 * videos 내 success 내부 Dto
 */
export interface VideoAnalyticsResponseDto {
  timeline: VideoAnalyticsDto[];
}

/**
 * 영상 이탈 분석 Dto
 */
export interface VideoExitAnalyticsDto {
  timestampMs: number;
  exitCount: number;
  exitRate: number;
}

/**
 * 영상 이탈 분석 응답 Dto
 */
export interface VideoExitAnalyticsResponseDto {
  exits: VideoExitAnalyticsDto[];
}

/**
 * 프로젝트 분석 요약 조회 Dto
 */
export interface ProjectAnalyticsSummaryDto {
  videoIds: string[];
  totalViews: number;
  avgDurationSeconds: number;
  completionRate: number;
  totalFeedbackCount: number;
}

/**
 * 슬라이드별 잔존률 조회 Dto
 */
export interface SlideRetentionDto {
  slideId: string;
  slideNum: number;
  title: string;
  sessionCount: number;
  retentionRate: number;
}

/**
 * 슬라이드별 잔존률 응답 Dto
 */
export interface SlideRetentionResponseDto {
  totalSessions: number;
  slideRetention: SlideRetentionDto[];
}

/**
 * 영상별 잔존률 조회 Dto
 */
export interface VideoRetentionDto {
  timestampMs: number;
  sessionCount: number;
  retentionRate: number;
}

/**
 * 영상별 잔존률 응답 Dto
 */
export interface VideoRetentionResponseDto {
  totalSessions: number;
  durationSeconds: number;
  intervalMs: number;
  videoRetention: VideoRetentionDto[];
}
