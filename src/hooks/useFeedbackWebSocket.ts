/**
 * @file useFeedbackWebSocket.ts
 * @description 피드백 페이지에서 사용하는 웹소켓 훅
 *
 * 실시간 댓글/리액션 이벤트를 수신하여 Zustand 스토어를 업데이트합니다.
 */
import { useCallback } from 'react';

import { useSlideStore } from '@/stores/slideStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
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

export function useFeedbackWebSocket({
  projectId,
  enabled = true,
  feedbackType = 'slide',
}: UseFeedbackWebSocketOptions) {
  // Zustand 스토어 액션 - 개별적으로 가져와서 무한 루프 방지
  // TODO: 실제 웹소켓 이벤트 처리 시 사용 예정
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addOpinion = useSlideStore((state) => state.addOpinion);
  const deleteOpinion = useSlideStore((state) => state.deleteOpinion);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const slideToggleReaction = useSlideStore((state) => state.toggleReaction);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addVideoComment = useVideoFeedbackStore((state) => state.addComment);
  const deleteVideoComment = useVideoFeedbackStore((state) => state.deleteComment);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const videoToggleReaction = useVideoFeedbackStore((state) => state.toggleReaction);

  // ========== 이벤트 핸들러 ==========

  const handleNewComment = useCallback(
    (data: NewCommentPayload) => {
      console.log('[Feedback WebSocket] New comment:', data);

      // 새 댓글 알림 (본인이 작성한 것이 아닌 경우에만)
      showToast.info('새 댓글', '누군가 댓글을 작성했습니다.');

      // TODO: 서버 데이터를 로컬 Comment 타입으로 변환 후 스토어 업데이트
      // 현재는 REST API 호출 후 TanStack Query가 자동 갱신하므로
      // 웹소켓은 알림 용도로만 사용

      // 예시:
      // if (feedbackType === 'slide') {
      //   slideStoreActions.addOpinion(data.content, currentSlideIndex);
      // } else {
      //   videoStoreActions.addComment(data.content, timestampSeconds);
      // }
    },
    [feedbackType],
  );

  const handleCommentDeleted = useCallback(
    (data: CommentDeletedPayload) => {
      console.log('[Feedback WebSocket] Comment deleted:', data);

      // 댓글 삭제 처리
      if (feedbackType === 'slide') {
        deleteOpinion(String(data.commentId));
      } else {
        deleteVideoComment(String(data.commentId));
      }
    },
    [feedbackType, deleteOpinion, deleteVideoComment],
  );

  const handleNewReaction = useCallback((data: NewReactionPayload) => {
    console.log('[Feedback WebSocket] New reaction:', data);

    // 리액션 추가 애니메이션 표시 (선택)
    showToast.success('👍', '누군가 반응했습니다!');

    // TODO: 서버에서 전체 카운트를 받아 동기화하는 것이 더 안전
    // 현재는 REST API 응답이 최신 상태를 반환하므로 추가 처리 불필요
  }, []);

  const handleReactionRemoved = useCallback((data: ReactionRemovedPayload) => {
    console.log('[Feedback WebSocket] Reaction removed:', data);

    // 리액션 제거 처리
    // TODO: 서버에서 카운트 갱신 이벤트를 받아 처리
  }, []);

  const handleReactionCountUpdated = useCallback((data: ReactionCountUpdatedPayload) => {
    console.log('[Feedback WebSocket] Reaction count updated:', data);

    // 리액션 카운트 동기화
    // TODO: 서버에서 받은 counts 객체를 스토어에 반영
    // 예시:
    // Object.entries(data.counts).forEach(([emoji, count]) => {
    //   // 스토어 업데이트 로직
    // });
  }, []);

  const handleConnect = useCallback(() => {
    console.log(`[Feedback WebSocket] Connected to project: ${projectId}`);
    showToast.success('실시간 연결됨', '피드백이 실시간으로 동기화됩니다.');
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
