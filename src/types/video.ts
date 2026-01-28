/**
 * @file video.ts
 * @description 영상 피드백 데이터 모델
 *
 * 영상의 특정 타임스탬프에 대한 댓글과 리액션을 관리합니다.
 */
import type { Comment } from './comment';
import type { Reaction, ReactionEvent, ReactionType } from './script';

/**
 * 재생바 세그먼트 하이라이트 (5초 버킷)
 *
 * 영상을 5초 단위로 나눠 각 구간의 대표 리액션을 표시합니다.
 * - 전체 세그먼트 중 리액션 총합이 많은 상위 10개만 표시
 * - 동점일 경우 REACTION_TYPES 순서(fire > sleepy > good > bad > confused)로 우선
 * - 세그먼트 시작 지점에 이모지 표시
 */
export interface SegmentHighlight {
  /** 세그먼트 시작 시간 (초) */
  startTime: number;
  /** 세그먼트 종료 시간 (초) */
  endTime: number;
  /** 대표 리액션 타입 */
  topReactionType: ReactionType;
  /** 대표 리액션 카운트 */
  count: number;
  /** 세그먼트 내 전체 리액션 총합 (순위 결정용) */
  totalCount: number;
}

/**
 * 타임스탬프별 피드백 데이터
 *
 * 영상의 특정 시점(초 단위)에 달린 댓글과 리액션을 포함합니다.
 */
export interface VideoTimestampFeedback {
  /** 영상 내 타임스탬프 (초 단위, 예: 5.5 = 5초 500ms) */
  timestamp: number;
  /** 해당 타임스탬프의 댓글 목록 */
  comments: Comment[];
  /** 해당 타임스탐프의 리액션 목록 */
  reactions: Reaction[];
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
  comments: Comment[];

  /** 모든 리액션 이벤트 */
  reactionEvents: ReactionEvent[];
}
