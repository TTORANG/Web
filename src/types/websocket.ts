/**
 * @file websocket.ts
 * @description 웹소켓 이벤트 타입 정의
 *
 * 백엔드 Socket.IO 서버 스펙에 맞춰 작성됨
 */

/**
 * Room(같은 프로젝트를 보는 사람들의 그룹) 관련 이벤트 페이로드
 */
export interface JoinProjectPayload {
  projectId: number | string;
}

export interface LeaveProjectPayload {
  projectId: number | string;
}

export interface JoinedProjectResponse {
  projectId: number | string;
  message: string;
}

export interface LeftProjectResponse {
  projectId: number | string;
  message: string;
}

export interface RoomsListResponse {
  rooms: string[];
}

/**
 * 댓글 관련 이벤트 페이로드
 */
export interface NewCommentPayload {
  commentId: number;
  videoId: number;
  userId: number;
  content: string;
  createdAt: string;
}

export interface CommentDeletedPayload {
  commentId: number;
}

/**
 * 리액션 관련 이벤트 페이로드
 */
export interface NewReactionPayload {
  reactionId: number;
  videoId: number;
  userId: number;
  emoji: string;
  timestamp: number; // ms
}

export interface ReactionRemovedPayload {
  reactionId: number;
}

export interface ReactionCountUpdatedPayload {
  videoId: number;
  counts: Record<string, number>;
}

/**
 * 에러 이벤트 페이로드
 */
export interface ErrorPayload {
  message: string;
}

/**
 * 클라이언트 → 서버 이벤트명
 */
export const ClientEvents = {
  JOIN_PROJECT: 'join-project',
  LEAVE_PROJECT: 'leave-project',
  GET_ROOMS: 'get-rooms',
} as const;

/**
 * 서버 → 클라이언트 이벤트명
 */
export const ServerEvents = {
  // Room 관련
  JOINED_PROJECT: 'joined-project',
  LEFT_PROJECT: 'left-project',
  ROOMS_LIST: 'rooms-list',

  // 댓글 관련
  NEW_COMMENT: 'new-comment',
  COMMENT_DELETED: 'comment-deleted',

  // 리액션 관련
  NEW_REACTION: 'new-reaction',
  REACTION_REMOVED: 'reaction-removed',
  REACTION_COUNT_UPDATED: 'reaction-count-updated',

  // 에러
  ERROR: 'error',
} as const;

/**
 * Socket.IO 연결 설정 옵션
 */
export interface SocketAuthConfig {
  /** JWT 액세스 토큰 (선택) */
  token?: string | null;
  /** 익명 사용자 식별용 세션 ID (선택) */
  sessionId?: string | null;
}
