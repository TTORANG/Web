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
import type { Comment } from '@/types/comment';
import type { Reaction, ReactionType } from '@/types/script';
import type { VideoFeedback, VideoTimestampFeedback } from '@/types/video';
import { deleteFromFlat, updateInFlat } from '@/utils/comment';

// 현재 시간대에 리액션 찾기
const getOrCreateFeedback = (
  feedbacks: VideoTimestampFeedback[],
  currentTime: number,
): { target: VideoTimestampFeedback; feedbacks: VideoTimestampFeedback[] } => {
  const currentTimeMs = currentTime * 1000;
  const windowMs = FEEDBACK_WINDOW * 1000;

  const targetFeedback = feedbacks.find((f) => Math.abs(f.timestampMs - currentTimeMs) <= windowMs);

  if (targetFeedback) {
    return { target: targetFeedback, feedbacks };
  }

  const newFeedback: VideoTimestampFeedback = {
    timestampMs: Math.round(currentTimeMs),
    comments: [],
    reactions: createDefaultReactions(),
  };

  return {
    target: newFeedback,
    feedbacks: [...feedbacks, newFeedback].sort((a, b) => a.timestampMs - b.timestampMs),
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

  /** 리액션 관련 - feedbacks의 reactions 업데이트 (카운트 +1) */
  addReaction: (type: ReactionType) => void;

  /** 댓글 관련 메서드들 - feedbacks의 comments 업데이트 */
  deleteComment: (commentId: string) => void;
  updateComment: (commentId: string, content: string) => void;

  /** 댓글 목록 전체 업데이트 (서버에서 다시 가져온 데이터로 교체) */
  updateFeedbacks: (feedbacks: VideoTimestampFeedback[]) => void;
}

function hasCommentId(flat: Comment[], commentId: string) {
  return flat.some((c) => c.commentId === commentId);
}

export const useVideoFeedbackStore = create<VideoFeedbackState>()(
  devtools((set) => ({
    video: null,
    currentTime: 0,
    seekTo: null,

    initVideo: (video) => set({ video, currentTime: 0, seekTo: null }, false, 'video/init'),

    updateCurrentTime: (time) => set({ currentTime: time }, false, 'video/updateTime'),

    requestSeek: (time) => set({ seekTo: time, currentTime: time }, false, 'video/requestSeek'),

    clearSeek: () => set({ seekTo: null }, false, 'video/clearSeek'),

    addReaction: (type) =>
      set(
        (state) => {
          if (!state.video) return state;

          const { target: targetFeedback, feedbacks } = getOrCreateFeedback(
            state.video.feedbacks,
            state.currentTime,
          );

          const updatedReactions = targetFeedback.reactions.map((r: Reaction) => {
            if (r.type === type) {
              return { ...r, count: r.count + 1 };
            }
            return r;
          });

          const updatedFeedbacks = feedbacks.map((f) =>
            f.timestampMs === targetFeedback.timestampMs
              ? { ...f, reactions: updatedReactions }
              : f,
          );

          return {
            video: { ...state.video, feedbacks: updatedFeedbacks },
          };
        },
        false,
        'video/addReaction',
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
            f.timestampMs === targetFeedback.timestampMs ? { ...f, comments: updatedComments } : f,
          );

          return {
            video: { ...state.video, feedbacks: updatedFeedbacks },
          };
        },
        false,
        'video/deleteComment',
      ),

    updateComment: (commentId, content) =>
      set(
        (state) => {
          if (!state.video) return state;

          const targetFeedback = state.video.feedbacks.find((f) =>
            hasCommentId(f.comments, commentId),
          );

          if (!targetFeedback) return state;

          const updatedComments = updateInFlat(targetFeedback.comments, commentId, content);

          const updatedFeedbacks = state.video.feedbacks.map((f) =>
            f.timestampMs === targetFeedback.timestampMs ? { ...f, comments: updatedComments } : f,
          );

          return {
            video: { ...state.video, feedbacks: updatedFeedbacks },
          };
        },
        false,
        'video/updateComment',
      ),

    updateFeedbacks: (feedbacks) =>
      set(
        (state) => {
          if (!state.video) return state;

          return {
            video: { ...state.video, feedbacks },
          };
        },
        false,
        'video/updateFeedbacks',
      ),
  })),
);
