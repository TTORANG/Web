import type { ReactionType } from '@/types/script';

/**
 * 슬라이드 리액션 토글 요청 DTO
 *
 * TODO: 백엔드 확정 시 필드명 `type` → `emojiType`으로 변경 필요
 */
export interface ToggleSlideReactionDto {
  type: ReactionType;
}

/**
 * 슬라이드 리액션 토글 응답 DTO
 */
export interface ToggleSlideReactionResponseDto {
  active: boolean;
}

/**
 * 영상 리액션 토글 요청 DTO
 *
 * TODO: 백엔드 확정 시 필드명 `type` → `emojiType`, `timestamp` → `timestampMs`(밀리초)로 변경 필요
 */
export interface ToggleVideoReactionDto {
  type: ReactionType;
  timestamp: number;
}

/**
 * 영상 리액션 토글 응답 DTO
 */
export interface ToggleVideoReactionResponseDto {
  active: boolean;
}

/**
 * 특정 슬라이드에 달린 모든 이모지 리액션을 집계하여 반환 Dto
 *
 * TODO: 백엔드 emojiType 확정 후 키 이름 변경 필요
 */
export interface ReactionCountDto {
  slideId: string;
  reactions: Record<ReactionType, number>;
}
