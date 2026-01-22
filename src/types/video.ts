/**
 * @file video.ts
 * @description 영상 피드백 데이터 모델
 *
 * 영상의 특정 타임스탬프에 대한 댓글과 리액션을 관리합니다.
 */
import type { CommentItem } from './comment';
import type { EmojiReaction, ReactionEvent } from './script';

/**
 * 타임스탬프별 피드백 데이터
 *
 * 영상의 특정 시점(초 단위)에 달린 댓글과 리액션을 포함합니다.
 */
export interface VideoTimestampFeedback {
  /** 영상 내 타임스탬프 (초 단위, 예: 5.5 = 5초 500ms) */
  timestamp: number;
  /** 해당 타임스탬프의 댓글 목록 */
  comments: CommentItem[];
  /** 해당 타임스탐프의 리액션 목록 */
  reactions: EmojiReaction[];
}

/**
 * 영상 피드백 페이지 상태
 *
 * 전체 영상의 모든 타임스탬프 피드백을 관리합니다.
 */
export interface VideoFeedback {
  videoId: string;
  videoUrl: string;
  title: string;
  duration: number; // 초 단위
  /** 타임스탐프별 피드백 (타임스탐프 오름차순 정렬) */
  feedbacks: VideoTimestampFeedback[];

  /** 댓글은 그냥 배열  */
  comments: CommentItem[];

  /** 모든 리액션 이벤트 */
  reactionEvents: ReactionEvent[];
}
