// /**
//  * @file videoFeedbackStore.ts
//  * @description 영상 피드백 상태 관리 Zustand 스토어
//  * - 댓글의 "영상 이동 참조"는 slideRef(문자열) 대신 videoSecondsRef(숫자)로 저장
// * - 리액션/댓글은 "누른 정확한 시점(currentTime)" 그대로 저장
// * - store는 데이터 저장만 담당 (판단x)
//  */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { MOCK_CURRENT_USER } from '@/mocks/users';
import type { Comment } from '@/types/comment';
import type { ReactionType } from '@/types/script';
import type { VideoFeedback } from '@/types/video';
import { addReplyToFlat, createComment, deleteFromFlat } from '@/utils/comment';

// ±구간 설정 (useVideoReactions.ts와 동일)
const WINDOW = 5;

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
  addComment: (content: string) => void;
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

          // 현재 시간에 해당하는 ±WINDOW 버킷 찾기
          const targetFeedback = state.video.feedbacks.find(
            (f) => Math.abs(f.timestamp - state.currentTime) <= WINDOW,
          );

          // 해당하는 피드백이 없으면 새로 생성
          if (!targetFeedback) {
            const newFeedback = {
              timestamp: Math.round(state.currentTime / 5) * 5, // 5초 버킷
              comments: [],
              reactions: [
                { type: 'fire' as const, count: 0, active: false },
                { type: 'sleepy' as const, count: 0, active: false },
                { type: 'good' as const, count: 0, active: false },
                { type: 'bad' as const, count: 0, active: false },
                { type: 'confused' as const, count: 0, active: false },
              ],
            };
            return {
              video: {
                ...state.video,
                feedbacks: [...state.video.feedbacks, newFeedback].sort(
                  (a, b) => a.timestamp - b.timestamp,
                ),
              },
            };
          }

          // 해당 피드백에서 리액션 토글 (슬라이드처럼)
          const updatedReactions = targetFeedback.reactions.map((r) => {
            if (r.type !== type) return r;

            // active -> 비활성 (카운트 감소)
            if (r.active) {
              return { ...r, active: false, count: Math.max(0, r.count - 1) };
            }
            // 비활성 -> 활성 (카운트 증가)
            return { ...r, active: true, count: r.count + 1 };
          });

          const updatedFeedbacks = state.video.feedbacks.map((f) =>
            f.timestamp === targetFeedback!.timestamp ? { ...f, reactions: updatedReactions } : f,
          );

          return {
            video: { ...state.video, feedbacks: updatedFeedbacks },
          };
        },
        false,
        'video/toggleReaction',
      ),

    addComment: (content) =>
      set(
        (state) => {
          if (!state.video) return state;

          const trimmed = content.trim();
          if (!trimmed) return state;

          // 현재 시간에 해당하는 ±WINDOW 버킷 찾기
          let targetFeedback = state.video.feedbacks.find(
            (f) => Math.abs(f.timestamp - state.currentTime) <= WINDOW,
          );

          // 해당하는 피드백이 없으면 새로 생성
          if (!targetFeedback) {
            const newFeedback = {
              timestamp: Math.round(state.currentTime / 5) * 5,
              comments: [],
              reactions: [
                { type: 'fire' as const, count: 0, active: false },
                { type: 'sleepy' as const, count: 0, active: false },
                { type: 'good' as const, count: 0, active: false },
                { type: 'bad' as const, count: 0, active: false },
                { type: 'confused' as const, count: 0, active: false },
              ],
            };
            state.video.feedbacks.push(newFeedback);
            targetFeedback = newFeedback;
          }

          const newComment: Comment = {
            ...createComment({
              content: trimmed,
              authorId: MOCK_CURRENT_USER.id,
            }),
            videoSecondsRef: state.currentTime,
            slideRef: undefined,
          };

          const updatedFeedbacks = state.video.feedbacks.map((f) =>
            f.timestamp === targetFeedback!.timestamp
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
