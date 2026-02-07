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
export interface ReadSlideAnalyticsResponseDto {
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
export interface ReadVideoAnalyticsResponseDto {
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
export interface ReadVideoExitAnalyticsResponseDto {
  exits: VideoExitAnalyticsDto[];
}

/**
 * 프로젝트 분석 요약 조회 Dto
 */
export interface ReadProjectAnalyticsSummaryDto {
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
export interface ReadSlideRetentionResponseDto {
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
export interface ReadVideoRetentionResponseDto {
  totalSessions: number;
  durationSeconds: number;
  intervalMs: number;
  videoRetention: VideoRetentionDto[];
}

/**
 * 최근 댓글 피드백 응답 Dto
 */
export interface ReadRecentCommentListResponseDto {
  comments: RecentCommentDto[];
}

/**
 * 최근 댓글 피드백 조회 Dto
 */
export interface RecentCommentDto {
  commentId: string;
  content: string;
  timestampMs: number;
  createdAt: string;
  user: RecentCommentUserDto;
  slide: RecentCommentSlideDto;
}

/**
 * 최근 댓글 피드백 유저 Dto
 */
export interface RecentCommentUserDto {
  userId: string;
  nickName: string;
  name: string;
}

/**
 * 최근 댓글 피드백 슬라이드 Dto
 */
export interface RecentCommentSlideDto {
  slideId: string;
  slideNum: number;
  title: string;
  imageUrl: string;
}
