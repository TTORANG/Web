/**
 * @file useFeedbackWebSocket.ts
 * @description 피드백 페이지에서 사용하는 웹소켓 훅
 *
 * 실시간 댓글/리액션 이벤트를 수신하여 Zustand Store를 직접 업데이트합니다.
 */
import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryClient';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type {
  CommentDeletedPayload,
  NewCommentPayload,
  NewReactionPayload,
  ReactionCountUpdatedPayload,
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
      // console.log('[Feedback WebSocket] New comment:', data);

      // 새 댓글 알림
      showToast.info('새 댓글', '누군가 댓글을 작성했습니다.');

      // WebSocket 페이로드에서 직접 Store 업데이트
      const currentVideo = useVideoFeedbackStore.getState().video;
      if (currentVideo && data.videoId === currentVideo.videoId) {
        // console.log('🔄 [Feedback WebSocket] Adding comment to store from WebSocket data...');

        // WebSocket 데이터에서 받은 정보로 댓글 추가
        // 서버가 이미 초 단위로 전송
        const timestampSeconds = data.timestamp ?? 0;
        useVideoFeedbackStore.getState().addComment(data.content, timestampSeconds);
      }

      // TanStack Query 캐시 무효화
      if (data.videoId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.videos.detail(String(data.videoId)),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.detail(String(projectId)),
      });
    },
    [queryClient, projectId],
  );

  const handleCommentDeleted = useCallback(
    (data: CommentDeletedPayload) => {
      // console.log('[Feedback WebSocket] Comment deleted:', data);

      // 댓글 삭제 알림
      showToast.info('댓글 삭제됨', '댓글이 삭제되었습니다.');

      // WebSocket 페이로드에서 직접 Store 업데이트
      if (data.commentId) {
        // console.log('🔄 [Feedback WebSocket] Removing comment from store...');
        useVideoFeedbackStore.getState().deleteComment(String(data.commentId));
      }

      // TanStack Query 캐시 무효화
      void queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.detail(String(projectId)),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.lists() });
    },
    [queryClient, projectId],
  );

  const handleNewReaction = useCallback(
    (data: NewReactionPayload) => {
      // console.log('[Feedback WebSocket] New reaction:', data);

      // 리액션 추가 애니메이션 표시
      showToast.success('👍', '누군가 반응했습니다!');

      // TanStack Query 캐시 무효화 - 비디오별 리액션 목록 갱신
      if (data.videoId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.videos.detail(String(data.videoId)),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.detail(String(projectId)),
      });
    },
    [queryClient, projectId],
  );

  const handleReactionRemoved = useCallback(() => {
    // console.log('[Feedback WebSocket] Reaction removed:', data);

    // TanStack Query 캐시 무효화
    void queryClient.invalidateQueries({
      queryKey: queryKeys.presentations.detail(String(projectId)),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.videos.lists() });
  }, [queryClient, projectId]);

  const handleReactionCountUpdated = useCallback(
    (data: ReactionCountUpdatedPayload) => {
      // console.log('[Feedback WebSocket] Reaction count updated:', data);

      // TanStack Query 캐시 무효화 - 비디오별 리액션 카운트 갱신
      if (data.videoId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.videos.detail(String(data.videoId)),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.detail(String(projectId)),
      });
    },
    [queryClient, projectId],
  );

  const handleConnect = useCallback(() => {
    // console.log(`[Feedback WebSocket] Connected to project: ${projectId}`);
    showToast.success('실시간 연결됨', '피드백이 실시간으로 동기화됩니다.');

    // 연결 성공 시 테스트 이벤트 전송 (디버깅용)
    // console.log('🧪 [Test] Sending test message to server...');
  }, []);

  const handleDisconnect = useCallback(() => {
    // console.log('[Feedback WebSocket] Disconnected');
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
