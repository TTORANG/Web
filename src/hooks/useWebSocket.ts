/**
 * @file useWebSocket.ts
 * @description Socket.IO 웹소켓 연결 및 이벤트 관리 훅
 *
 * 백엔드 Socket.IO 서버와 연결하여 실시간 이벤트를 처리합니다.
 * - 자동 재연결
 * - Room 관리
 * - 이벤트 리스너 등록
 */
import { useEffect, useRef, useState } from 'react';

import { Socket, io } from 'socket.io-client';

import { useAuthStore } from '@/stores/authStore';
import type {
  CommentDeletedPayload,
  ErrorPayload,
  JoinProjectPayload,
  JoinedProjectResponse,
  LeftProjectResponse,
  NewCommentPayload,
  NewReactionPayload,
  ReactionCountUpdatedPayload,
  ReactionRemovedPayload,
  RoomsListResponse,
  SocketAuthConfig,
} from '@/types/websocket';
import { showToast } from '@/utils/toast';

/**
 * 익명 사용자용 세션 ID 생성/조회
 */
function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'ttorang_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);

  // 세션id없으면 처음 방문한 사람임
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

interface UseWebSocketOptions {
  /** 프로젝트 ID (Room 구독용) */
  projectId: string | number;
  /** 웹소켓 연결 활성화 여부 */
  enabled?: boolean;
  /** 자동 Room join 여부 */
  autoJoin?: boolean;
  /** 새 댓글 수신 핸들러 */
  onNewComment?: (data: NewCommentPayload) => void;
  /** 댓글 삭제 수신 핸들러 */
  onCommentDeleted?: (data: CommentDeletedPayload) => void;
  /** 새 리액션 수신 핸들러 */
  onNewReaction?: (data: NewReactionPayload) => void;
  /** 리액션 제거 수신 핸들러 */
  onReactionRemoved?: (data: ReactionRemovedPayload) => void;
  /** 리액션 카운트 갱신 핸들러 */
  onReactionCountUpdated?: (data: ReactionCountUpdatedPayload) => void;
  /** 연결 성공 콜백 */
  onConnect?: () => void;
  /** 연결 끊김 콜백 */
  onDisconnect?: () => void;
}

export function useWebSocket({
  projectId,
  enabled = true,
  autoJoin = true,
  onNewComment,
  onCommentDeleted,
  onNewReaction,
  onReactionRemoved,
  onReactionCountUpdated,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRooms, setCurrentRooms] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  // 콜백 함수들을 ref로 저장하여 의존성 문제 해결
  const handlersRef = useRef({
    onNewComment,
    onCommentDeleted,
    onNewReaction,
    onReactionRemoved,
    onReactionCountUpdated,
    onConnect,
    onDisconnect,
  });

  // 최신 콜백으로 업데이트
  useEffect(() => {
    handlersRef.current = {
      onNewComment,
      onCommentDeleted,
      onNewReaction,
      onReactionRemoved,
      onReactionCountUpdated,
      onConnect,
      onDisconnect,
    };
  }, [
    onNewComment,
    onCommentDeleted,
    onNewReaction,
    onReactionRemoved,
    onReactionCountUpdated,
    onConnect,
    onDisconnect,
  ]);

  useEffect(() => {
    if (!enabled || !projectId) {
      console.log('[WebSocket] Connection disabled');
      return;
    }

    // 이미 연결되어 있으면 중복 연결 방지
    if (socketRef.current?.connected) {
      console.log('[WebSocket] Already connected, skipping...');
      return;
    }

    // 웹소켓 서버 URL
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

    // 인증 설정
    const auth: SocketAuthConfig = {
      token: accessToken ? `Bearer ${accessToken}` : null,
      sessionId: accessToken ? null : getOrCreateSessionId(),
    };

    console.log('[WebSocket] Connecting to:', wsUrl);
    console.log('[WebSocket] Auth:', auth.token ? 'JWT' : `Anonymous (${auth.sessionId})`);

    // Socket.IO 클라이언트 생성
    const socket = io(wsUrl, {
      auth,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // ========== 연결 이벤트 ==========
    socket.on('connect', () => {
      console.log('✅ [WebSocket] Connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      handlersRef.current.onConnect?.();

      // 자동으로 프로젝트 Room 입장
      if (autoJoin && projectId) {
        const payload: JoinProjectPayload = {
          projectId: String(projectId),
        };
        socket.emit('join-project', payload);
      }
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ [WebSocket] Disconnected:', reason);
      setIsConnected(false);
      setCurrentRooms([]);
      handlersRef.current.onDisconnect?.();
    });

    socket.on('connect_error', (error: Error) => {
      console.error('🔴 [WebSocket] Connection Error:', error);
      setConnectionError(error.message);

      // 연결 실패 시 토스트 표시 (첫 연결 시도에만)
      if (!socketRef.current?.connected) {
        showToast.warning(
          '웹소켓 서버 연결 실패',
          '로컬 서버가 실행 중인지 확인하세요. 실시간 동기화는 비활성화됩니다.',
        );
      }
    });

    // ========== Room 관련 이벤트 ==========
    socket.on('joined-project', (data: JoinedProjectResponse) => {
      console.log('[WebSocket] Joined project:', data);
      // Room 목록 갱신
      socket.emit('get-rooms');
    });

    socket.on('left-project', (data: LeftProjectResponse) => {
      console.log('[WebSocket] Left project:', data);
      socket.emit('get-rooms');
    });

    socket.on('rooms-list', (data: RoomsListResponse) => {
      console.log('[WebSocket] Current rooms:', data.rooms);
      setCurrentRooms(data.rooms);
    });

    // ========== 댓글 관련 이벤트 ==========
    socket.on('new-comment', (data: NewCommentPayload) => {
      console.log('💬 [WebSocket] New comment:', data);
      handlersRef.current.onNewComment?.(data);
    });

    // opinion 이벤트도 리스닝 (서버가 다른 이벤트명을 사용할 수 있음)
    socket.on('new-opinion', (data: unknown) => {
      console.log('💬 [WebSocket] New opinion:', data);
      // new-comment 핸들러 재사용
      if (data && typeof data === 'object') {
        handlersRef.current.onNewComment?.(data as NewCommentPayload);
      }
    });

    socket.on('comment-deleted', (data: CommentDeletedPayload) => {
      console.log('🗑️ [WebSocket] Comment deleted:', data);
      handlersRef.current.onCommentDeleted?.(data);
    });

    socket.on('opinion-deleted', (data: unknown) => {
      console.log('🗑️ [WebSocket] Opinion deleted:', data);
      if (data && typeof data === 'object') {
        handlersRef.current.onCommentDeleted?.(data as CommentDeletedPayload);
      }
    });

    // ========== 리액션 관련 이벤트 ==========
    socket.on('new-reaction', (data: NewReactionPayload) => {
      console.log('[WebSocket] New reaction:', data);
      handlersRef.current.onNewReaction?.(data);
    });

    socket.on('reaction-removed', (data: ReactionRemovedPayload) => {
      console.log('[WebSocket] Reaction removed:', data);
      handlersRef.current.onReactionRemoved?.(data);
    });

    socket.on('reaction-count-updated', (data: ReactionCountUpdatedPayload) => {
      console.log('[WebSocket] Reaction count updated:', data);
      handlersRef.current.onReactionCountUpdated?.(data);
    });

    // ========== 에러 처리 ==========
    socket.on('error', (data: ErrorPayload) => {
      console.error('[WebSocket] Error:', data.message);
      showToast.error('웹소켓 오류', data.message);
    });

    // 모든 이벤트 로깅 (개발 환경)
    if (import.meta.env.DEV) {
      socket.onAny((eventName: string, ...args: unknown[]) => {
        console.log('🔵 [WS Incoming]', eventName, args);
      });

      socket.onAnyOutgoing((eventName: string, ...args: unknown[]) => {
        console.log('🟢 [WS Outgoing]', eventName, args);
      });
    }

    // cleanup
    return () => {
      console.log('[WebSocket] Disconnecting...');

      if (socket.connected) {
        // 프로젝트 Room 퇴장
        socket.emit('leave-project', { projectId: String(projectId) });
        socket.disconnect();
      }

      socketRef.current = null;
    };
  }, [projectId, enabled, autoJoin, accessToken]); // 콜백 함수들 제거

  return {
    /** 연결 상태 */
    isConnected,
    /** 연결 에러 메시지 */
    connectionError,
    /** 현재 참여 중인 Room 목록 */
    currentRooms,
    /** 프로젝트 Room 입장 */
    joinProject: (projectId: string | number) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('join-project', { projectId: String(projectId) });
      }
    },
    /** 프로젝트 Room 퇴장 */
    leaveProject: (projectId: string | number) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('leave-project', { projectId: String(projectId) });
      }
    },
    /** 참여 중인 Room 목록 조회 */
    getRooms: () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('get-rooms');
      }
    },
  };
}
