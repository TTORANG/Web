import type { ReactionType } from '@/types/script';

/**
 * 슬라이드 리액션 생성 요청 DTO
 */
export interface CreateSlideReactionDto {
  emojiType: ReactionType;
}

/**
 * 슬라이드 리액션 생성 응답 DTO
 */
export interface CreateSlideReactionResponseDto {
  reactionId: string;
  slideId: string;
  emojiType: ReactionType;
  createdAt: string;
}

/**
 * 영상 리액션 토글 요청 DTO
 */
export interface ToggleVideoReactionDto {
  emojiType: ReactionType;
  timestampMs: number;
}

/**
 * 영상 리액션 토글 응답 DTO
 */
export interface ToggleVideoReactionResponseDto {
  reactionId: string;
  videoId: string;
  active: boolean;
}

/**
 * 특정 슬라이드에 달린 모든 이모지 리액션을 집계하여 반환 Dto
 */
export interface ReadReactionCountDto {
  slideId: string;
  reactions: Record<ReactionType, number>;
}

/**
 * 영상 리액션 구간 집계 항목 Dto
 */
export interface ReadVideoReactionSummaryItemDto {
  emojiType: ReactionType;
  count: number;
}

/**
 * 영상 리액션 타임라인 마커 Dto
 */
export interface ReadVideoReactionTimelineMarkerDto {
  timestampMs: number;
  emojiType: ReactionType;
  count: number;
}

/**
 * 영상 리액션 타임라인 응답 Dto
 */
export interface ReadVideoReactionTimelineResponseDto {
  intervalMs: number;
  markers: ReadVideoReactionTimelineMarkerDto[];
}

/**
 * 타임라인 버킷별 리액션 항목 Dto
 */
export interface ReadVideoReactionBucketDto {
  timestampMs: number;
  totalCount: number;
  reactions: Record<ReactionType, number>;
}

/**
 * 타임라인 버킷별 전체 리액션 조회 응답 Dto
 */
export interface ReadVideoReactionBucketsResponseDto {
  intervalMs: number;
  buckets: ReadVideoReactionBucketDto[];
}

/**
 * 프로젝트 전체 슬라이드 리액션 집계 조회 Dto
 */
export interface ReadReactionSummaryDto {
  projectId: string;
  totalReactions: Record<ReactionType, number>;
  totalCount: number;
}
