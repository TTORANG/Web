/**
 * @file videoFeedbackStore.ts
 * @description 영상 피드백 상태 관리 Zustand 스토어
 * - 댓글 참조는 ref: { kind: 'video', seconds } 형태로 저장
 * - 리액션/댓글은 "누른 정확한 시점(currentTime)" 그대로 저장
 * - store는 데이터 저장만 담당 (판단x)
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createDefaultReactions } from '@/constants/reaction';
import { FEEDBACK_WINDOW } from '@/constants/video';
import { MOCK_CURRENT_USER } from '@/mocks/users';
import type { Comment } from '@/types/comment';
import type { Reaction, ReactionType } from '@/types/script';
import type { VideoFeedback, VideoTimestampFeedback } from '@/types/video';
import { addReplyToFlat, createComment, deleteFromFlat } from '@/utils/comment';
import { extractTimestampFromComment } from '@/utils/format';

// 현재 시간대에 리액션 찾기
const getOrCreateFeedback = (
  feedbacks: VideoTimestampFeedback[],
  currentTime: number,
): { target: VideoTimestampFeedback; feedbacks: VideoTimestampFeedback[] } => {
  const targetFeedback = feedbacks.find(
    (f) => Math.abs(f.timestamp - currentTime) <= FEEDBACK_WINDOW,
  );

  if (targetFeedback) {
    return { target: targetFeedback, feedbacks };
  }

  const newFeedback: VideoTimestampFeedback = {
    timestamp: Math.round(currentTime),
    comments: [],
    reactions: createDefaultReactions(),
  };

  return {
    target: newFeedback,
    feedbacks: [...feedbacks, newFeedback].sort((a, b) => a.timestamp - b.timestamp),
  };
};

interface VideoFeedbackState {
  video: VideoFeedback | null;

  /** 실제 영상 재생 시간 */
  currentTime: number;

  /** seek 요청 */
  seekTo: number | null;

  initVideo: (video: VideoFeedback) => void;
  updateCurrentTime: (time: number) => void;

  requestSeek: (time: number) => void;
  clearSeek: () => void;

  /** 리액션 관련 - feedbacks의 reactions 업데이트 */
  toggleReaction: (type: ReactionType) => void;

  /** 댓글 관련 메서드들 - feedbacks의 comments 업데이트 */
  addComment: (content: string, seconds: number) => void;
  addReply: (parentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
}

function hasCommentId(flat: Comment[], id: string) {
  return flat.some((c) => c.id === id);
}

// function getAllComments(feedbacks: any[]): Comment[] {
//   return feedbacks.flatMap((f) => f.comments);
// }

export const useVideoFeedbackStore = create<VideoFeedbackState>()(
  devtools((set) => ({
    video: null,
    currentTime: 0,
    seekTo: null,

    initVideo: (video) => set({ video, currentTime: 0, seekTo: null }, false, 'video/init'),

    updateCurrentTime: (time) => set({ currentTime: time }, false, 'video/updateTime'),

    requestSeek: (time) => set({ seekTo: time }, false, 'video/requestSeek'),

    clearSeek: () => set({ seekTo: null }, false, 'video/clearSeek'),

    toggleReaction: (type) =>
      set(
        (state) => {
          if (!state.video) return state;

          const { target: targetFeedback, feedbacks } = getOrCreateFeedback(
            state.video.feedbacks,
            state.currentTime,
          );

          const updatedReactions = targetFeedback.reactions.map((r: Reaction) => {
            if (r.type !== type) return r;

            // active -> 비활성 (카운트 감소)
            if (r.active) {
              return { ...r, active: false, count: Math.max(0, r.count - 1) };
            }
            // 비활성 -> 활성 (카운트 증가)
            return { ...r, active: true, count: r.count + 1 };
          });

          const updatedFeedbacks = feedbacks.map((f) =>
            f.timestamp === targetFeedback.timestamp ? { ...f, reactions: updatedReactions } : f,
          );

          return {
            video: { ...state.video, feedbacks: updatedFeedbacks },
          };
        },
        false,
        'video/toggleReaction',
      ),

    addComment: (content, seconds) =>
      set(
        (state) => {
          if (!state.video) return state;

          const trimmed = content.trim();
          if (!trimmed) return state;

          // 댓글 텍스트에서 타임스탬프 파싱
          const parsed = extractTimestampFromComment(trimmed);

          // 타임스탬프가 있으면 해당 시간 사용, 없으면 전달받은 seconds 사용
          const refSeconds = parsed ? parsed.seconds : seconds;
          const ref = { kind: 'video' as const, seconds: refSeconds };
          const finalContent = parsed ? parsed.content : trimmed;

          const { target: targetFeedback, feedbacks } = getOrCreateFeedback(
            state.video.feedbacks,
            refSeconds,
          );

          const newComment: Comment = createComment({
            content: finalContent,
            authorId: MOCK_CURRENT_USER.id,
            ref,
          });

          const updatedFeedbacks = feedbacks.map((f) =>
            f.timestamp === targetFeedback.timestamp
              ? { ...f, comments: [newComment, ...f.comments] }
              : f,
          );

          return {
            video: { ...state.video, feedbacks: updatedFeedbacks },
          };
        },
        false,
        'video/addComment',
      ),

    addReply: (parentId, content) =>
      set(
        (state) => {
          if (!state.video) return state;

          //const allComments = getAllComments(state.video.feedbacks);
          const targetFeedback = state.video.feedbacks.find((f) =>
            hasCommentId(f.comments, parentId),
          );

          if (!targetFeedback) return state;

          const updatedComments = addReplyToFlat(targetFeedback.comments, parentId, {
            content: content.trim(),
            authorId: MOCK_CURRENT_USER.id,
          });

          const updatedFeedbacks = state.video.feedbacks.map((f) =>
            f.timestamp === targetFeedback.timestamp ? { ...f, comments: updatedComments } : f,
          );

          return {
            video: { ...state.video, feedbacks: updatedFeedbacks },
          };
        },
        false,
        'video/addReply',
      ),

    deleteComment: (commentId) =>
      set(
        (state) => {
          if (!state.video) return state;

          const targetFeedback = state.video.feedbacks.find((f) =>
            hasCommentId(f.comments, commentId),
          );

          if (!targetFeedback) return state;

          const updatedComments = deleteFromFlat(targetFeedback.comments, commentId);

          const updatedFeedbacks = state.video.feedbacks.map((f) =>
            f.timestamp === targetFeedback.timestamp ? { ...f, comments: updatedComments } : f,
          );

          return {
            video: { ...state.video, feedbacks: updatedFeedbacks },
          };
        },
        false,
        'video/deleteComment',
      ),
  })),
);
