import type { ReactionType } from '@/types/script';

/**
 * 슬라이드 리액션 토글 요청 DTO
 */
export interface ToggleSlideReactionDto {
  type: ReactionType;
}
