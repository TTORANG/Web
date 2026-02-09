import type { ReactionType } from '@/types/script';

/**
 * 슬라이드 리액션 토글 요청 DTO
 */
export interface ToggleSlideReactionDto {
  emojiType: ReactionType;
}

/**
 * 슬라이드 리액션 토글 응답 DTO
 */
export interface ToggleSlideReactionResponseDto {
  active: boolean;
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
 * 프로젝트 전체 슬라이드 리액션 집계 조회 Dto
 */
export interface ReadReactionSummaryDto {
  projectId: string;
  totalReactions: Record<ReactionType, number>;
  totalCount: number;
}
