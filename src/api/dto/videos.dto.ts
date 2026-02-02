/**
 * @file videos.dto.ts
 * @description 영상 API 요청 DTO
 */
import type { EmojiType } from '@/types/api';

export interface CreateVideoDto {
  projectId: number;
  title: string;
}

export interface FinishRecordingDto {
  slideLogs: Array<{
    slideId: number;
    timestampMs: number;
  }>;
}

export interface ToggleVideoReactionDto {
  emojiType: EmojiType;
  timestampMs: number;
}

export interface CreateVideoCommentDto {
  content: string;
  timestampMs: number;
}
