/**
 * Socket.io 이벤트 타입 상수
 * 서버와 동일한 이벤트 이름 사용
 */

export const SocketEvents = {
  // ========== 클라이언트 → 서버 ==========
  JOIN_PROJECT: 'join-project',
  LEAVE_PROJECT: 'leave-project',
  GET_ROOMS: 'get-rooms',

  // ========== 서버 → 클라이언트 ==========
  // Room 관련
  JOINED_PROJECT: 'joined-project',
  LEFT_PROJECT: 'left-project',
  ROOMS_LIST: 'rooms-list',

  // 댓글 관련
  NEW_COMMENT: 'new-comment',
  COMMENT_UPDATED: 'comment-updated',
  COMMENT_DELETED: 'comment-deleted',

  // 리액션 관련
  NEW_REACTION: 'new-reaction',
  REACTION_REMOVED: 'reaction-removed',
  REACTION_COUNT_UPDATED: 'reaction-count-updated',

  // 에러
  ERROR: 'error',
} as const;

export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
