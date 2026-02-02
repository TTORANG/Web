/**
 * @file reactions.dto.ts
 * @description 리액션 API 요청 DTO
 */
import type { ReactionType } from '@/types/script';

export interface ToggleSlideReactionDto {
  type: ReactionType;
}
