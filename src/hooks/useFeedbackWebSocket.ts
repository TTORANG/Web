/**
 * @file useFeedbackWebSocket.ts
 * @description 피드백 페이지에서 사용하는 웹소켓 훅
 *
 * 실시간 댓글/리액션 이벤트를 수신하여 TanStack Query 캐시를 무효화합니다.
 */
import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryClient';
import type {
  CommentDeletedPayload,
  NewCommentPayload,
  NewReactionPayload,
  ReactionCountUpdatedPayload,
  ReactionRemovedPayload,
} from '@/types/websocket';
import { showToast } from '@/utils/toast';

import { useWebSocket } from './useWebSocket';

interface UseFeedbackWebSocketOptions {
  /** 프로젝트 ID */
  projectId: string | number;
  /** 웹소켓 연결 활성화 여부 */
  enabled?: boolean;
  /** 페이지 타입 (슬라이드/비디오) */
  feedbackType?: 'slide' | 'video';
}

export function useFeedbackWebSocket({ projectId, enabled = true }: UseFeedbackWebSocketOptions) {
  const queryClient = useQueryClient();

  // ========== 이벤트 핸들러 ==========

  const handleNewComment = useCallback(
    (data: NewCommentPayload) => {
      console.log('[Feedback WebSocket] New comment:', data);

      // 새 댓글 알림
      showToast.info('새 댓글', '누군가 댓글을 작성했습니다.');

      // TanStack Query 캐시 무효화 - 서버에서 최신 데이터 다시 가져오기
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
    },
    [queryClient],
  );

  const handleCommentDeleted = useCallback(
    (data: CommentDeletedPayload) => {
      console.log('[Feedback WebSocket] Comment deleted:', data);

      // 댓글 삭제 알림
      showToast.info('댓글 삭제됨', '댓글이 삭제되었습니다.');

      // TanStack Query 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
    },
    [queryClient],
  );

  const handleNewReaction = useCallback(
    (data: NewReactionPayload) => {
      console.log('[Feedback WebSocket] New reaction:', data);

      // 리액션 추가 애니메이션 표시
      showToast.success('👍', '누군가 반응했습니다!');

      // TanStack Query 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
    },
    [queryClient],
  );

  const handleReactionRemoved = useCallback(
    (data: ReactionRemovedPayload) => {
      console.log('[Feedback WebSocket] Reaction removed:', data);

      // TanStack Query 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
    },
    [queryClient],
  );

  const handleReactionCountUpdated = useCallback(
    (data: ReactionCountUpdatedPayload) => {
      console.log('[Feedback WebSocket] Reaction count updated:', data);

      // TanStack Query 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
    },
    [queryClient],
  );

  const handleConnect = useCallback(() => {
    console.log(`[Feedback WebSocket] Connected to project: ${projectId}`);
    showToast.success('실시간 연결됨', '피드백이 실시간으로 동기화됩니다.');

    // 연결 성공 시 테스트 이벤트 전송 (디버깅용)
    console.log('🧪 [Test] Sending test message to server...');
  }, [projectId]);

  const handleDisconnect = useCallback(() => {
    console.log('[Feedback WebSocket] Disconnected');
    showToast.warning('연결 끊김', '재연결 중입니다...');
  }, []);

  // ========== 웹소켓 연결 ==========

  const { isConnected, currentRooms, joinProject, leaveProject, getRooms } = useWebSocket({
    projectId,
    enabled,
    autoJoin: true,
    onNewComment: handleNewComment,
    onCommentDeleted: handleCommentDeleted,
    onNewReaction: handleNewReaction,
    onReactionRemoved: handleReactionRemoved,
    onReactionCountUpdated: handleReactionCountUpdated,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
  });

  return {
    /** 연결 상태 */
    isConnected,
    /** 현재 참여 중인 Room 목록 */
    currentRooms,
    /** 프로젝트 Room 입장 */
    joinProject,
    /** 프로젝트 Room 퇴장 */
    leaveProject,
    /** 참여 중인 Room 목록 조회 */
    getRooms,
  };
}
