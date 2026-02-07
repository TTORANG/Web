import type { ReactionType } from '@/types/script';

/**
 * 슬라이드 리액션 토글 요청 DTO
 */
export interface ToggleSlideReactionDto {
  type: ReactionType;
}

/**
 * 특정 슬라이드에 달린 모든 이모지 리액션을 집계하여 반환 Dto
 */
export interface ReactionCountDto {
  slideId: string;
  reactions: {
    fire: number;
    good: number;
    bad: number;
    sleepy: number;
    confused: number;
  };
}

/**
 * 프로젝트 전체 슬라이드 리액션 집계 조회 Dto
 */
export interface ReactionSummaryDto {
  projectId: string;
  totalReactions: {
    fire: number;
    good: number;
    bad: number;
    sleepy: number;
    confused: number;
  };
  totalCount: number;
}
