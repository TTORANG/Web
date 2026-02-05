/**
 * Socket.io 클라이언트 초기화 및 관리
 * 서버와의 실시간 양방향 통신 담당
 */
import { Socket, io } from 'socket.io-client';

const SOCKET_URL = 'https://ttorang-server-407623424780.asia-northeast3.run.app';

let socket: Socket | null = null;

/**
 * Socket.io 클라이언트 초기화
 * @param token - JWT 인증 토큰 (선택사항, 없으면 익명 사용자)
 * @param sessionId - 익명 사용자용 세션 ID (선택사항)
 */
export const initializeSocket = (token?: string | null, sessionId?: string): Socket => {
  // 이미 연결된 소켓이 있으면 재사용
  if (socket?.connected) {
    console.log('[Socket.io] Already connected, reusing existing connection');
    return socket;
  }

  // 기존 소켓이 있으면 정리
  if (socket) {
    socket.disconnect();
  }

  // 새 소켓 연결
  socket = io(SOCKET_URL, {
    auth: {
      token: token || undefined,
      sessionId: sessionId || undefined,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // 연결 이벤트 핸들러
  socket.on('connect', () => {
    console.log('[Socket.io] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.io] Connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('[Socket.io] Error:', error);
  });

  return socket;
};

/**
 * 현재 소켓 인스턴스 반환
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * 소켓 연결 해제
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('[Socket.io] Disconnecting...');
    socket.disconnect();
    socket = null;
  }
};

/**
 * 프로젝트 Room 입장
 * @param projectId - 프로젝트 ID
 */
export const joinProject = (projectId: string): void => {
  if (!socket?.connected) {
    console.warn('[Socket.io] Cannot join project - not connected');
    return;
  }

  socket.emit('join-project', { projectId });
  console.log('[Socket.io] Joining project:', projectId);
};

/**
 * 프로젝트 Room 퇴장
 * @param projectId - 프로젝트 ID
 */
export const leaveProject = (projectId: string): void => {
  if (!socket?.connected) {
    console.warn('[Socket.io] Cannot leave project - not connected');
    return;
  }

  socket.emit('leave-project', { projectId });
  console.log('[Socket.io] Leaving project:', projectId);
};

/**
 * 현재 참여 중인 Room 목록 조회 (디버깅용)
 */
export const getRooms = (): void => {
  if (!socket?.connected) {
    console.warn('[Socket.io] Cannot get rooms - not connected');
    return;
  }

  socket.emit('get-rooms');
};
