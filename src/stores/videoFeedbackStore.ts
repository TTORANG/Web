/**
 * @file videoFeedbackStore.ts
 * @description 영상 피드백 상태 관리 Zustand 스토어
 * ✅ CHANGED:
 * - requestSeek / clearSeek / seekTo 값을 추가
 * - CommentList의 onGoToSlideRef가 requestSeek를 호출하면
 *   VideoViewer가 seekTo를 구독해서 실제 video.currentTime을 변경함
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { MOCK_CURRENT_USER } from '@/mocks/users';
import type { CommentItem } from '@/types/comment';
import type { ReactionType } from '@/types/script';
import type { VideoFeedback } from '@/types/video';
import { addReplyToFlat, createComment, deleteFromFlat } from '@/utils/comment';

interface VideoFeedbackState {
  video: VideoFeedback | null;

  /**
   * ✅ CHANGED:
   * - currentTime: 실제 재생 시간(초). 마커(±5초 필터) 같은 "현재시점 UI" 기준
   */
  currentTime: number;

  /**
   * ✅ CHANGED:
   * - activeTimestamp: 5초 단위 버킷 시간(0,5,10,15...)
   * - ReactionButtons / addComment / toggleReaction 등 "피드백 저장/노출 기준"은 이 값을 씀
   */
  activeTimestamp: number;

  seekTo: number | null;

  initVideo: (video: VideoFeedback) => void;

  /**
   * ✅ CHANGED:
   * - updateTimestamp가 currentTime + activeTimestamp 둘 다 갱신
   */
  updateTimestamp: (timestamp: number) => void;

  requestSeek: (timeSec: number) => void;
  clearSeek: () => void;

  addComment: (content: string) => void;
  addReply: (parentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  toggleReaction: (type: ReactionType) => void;
  setComments: (comments: CommentItem[]) => void;
}

export const useVideoFeedbackStore = create<VideoFeedbackState>()(
  devtools(
    (set) => ({
      video: null,
      currentTime: 0,
      activeTimestamp: 0,

      seekTo: null,

      initVideo: (video) => {
        set(
          {
            video,
            currentTime: 0,
            activeTimestamp: 0,
            seekTo: null,
          },
          false,
          'videoFeedback/initVideo',
        );
      },

      updateTimestamp: (timestamp) => {
        set(
          (state) => {
            if (!state.video) return state;

            // (기존 유지) 0.5초 단위로 반올림
            const roundedTime = Math.round(timestamp * 2) / 2;

            // CHANGED: 5초 단위 버킷 (0,5,10,15...)
            const bucket = Math.floor(roundedTime / 5) * 5;

            // 둘 다 동일하면 상태 업데이트 생략
            if (state.currentTime === roundedTime && state.activeTimestamp === bucket) {
              return state;
            }

            return {
              currentTime: roundedTime,
              activeTimestamp: bucket,
            };
          },
          false,
          'videoFeedback/updateTimestamp',
        );
      },

      requestSeek: (timeSec) => {
        set({ seekTo: timeSec }, false, 'videoFeedback/requestSeek');
      },

      clearSeek: () => {
        set({ seekTo: null }, false, 'videoFeedback/clearSeek');
      },

      addComment: (content) => {
        set(
          (state) => {
            if (!state.video) return state;

            const trimmed = content.trim();
            if (!trimmed) return state;

            // CHANGED: 댓글이 "현재 재생 시간"이 아니라 "5초 버킷(activeTimestamp)"에 저장
            const newComment = createComment({
              content: trimmed,
              authorId: MOCK_CURRENT_USER.id,
              slideRef: `${state.activeTimestamp}초`,
            });

            let feedback = state.video.feedbacks.find((f) => f.timestamp === state.activeTimestamp);

            if (!feedback) {
              feedback = {
                timestamp: state.activeTimestamp,
                comments: [],
                reactions: [
                  { type: 'fire', count: 0 },
                  { type: 'sleepy', count: 0 },
                  { type: 'good', count: 0 },
                  { type: 'bad', count: 0 },
                  { type: 'confused', count: 0 },
                ],
              };
            }

            const updatedFeedbacks = state.video.feedbacks
              .filter((f) => f.timestamp !== state.activeTimestamp)
              .concat({
                ...feedback,
                comments: [newComment, ...feedback.comments],
              })
              .sort((a, b) => a.timestamp - b.timestamp);

            return {
              video: { ...state.video, feedbacks: updatedFeedbacks },
            };
          },
          false,
          'videoFeedback/addComment',
        );
      },

      addReply: (parentId, content) => {
        set(
          (state) => {
            if (!state.video) return state;

            // CHANGED: activeTimestamp 기준
            const feedback = state.video.feedbacks.find(
              (f) => f.timestamp === state.activeTimestamp,
            );
            if (!feedback) return state;

            const updatedComments = addReplyToFlat(feedback.comments, parentId, {
              content,
              authorId: MOCK_CURRENT_USER.id,
            });

            const updatedFeedbacks = state.video.feedbacks.map((f) =>
              f.timestamp === state.activeTimestamp ? { ...f, comments: updatedComments } : f,
            );

            return {
              video: { ...state.video, feedbacks: updatedFeedbacks },
            };
          },
          false,
          'videoFeedback/addReply',
        );
      },

      deleteComment: (commentId) => {
        set(
          (state) => {
            if (!state.video) return state;

            // CHANGED: activeTimestamp 기준
            const feedback = state.video.feedbacks.find(
              (f) => f.timestamp === state.activeTimestamp,
            );
            if (!feedback) return state;

            const updatedComments = deleteFromFlat(feedback.comments, commentId);

            const updatedFeedbacks = state.video.feedbacks.map((f) =>
              f.timestamp === state.activeTimestamp ? { ...f, comments: updatedComments } : f,
            );

            return {
              video: { ...state.video, feedbacks: updatedFeedbacks },
            };
          },
          false,
          'videoFeedback/deleteComment',
        );
      },

      toggleReaction: (type) => {
        set(
          (state) => {
            if (!state.video) return state;

            // CHANGED: activeTimestamp 기준
            let feedback = state.video.feedbacks.find((f) => f.timestamp === state.activeTimestamp);

            if (!feedback) {
              feedback = {
                timestamp: state.activeTimestamp,
                comments: [],
                reactions: [
                  { type: 'fire', count: 0 },
                  { type: 'sleepy', count: 0 },
                  { type: 'good', count: 0 },
                  { type: 'bad', count: 0 },
                  { type: 'confused', count: 0 },
                ],
              };
            }

            const updatedReactions = feedback.reactions.map((r) => {
              if (r.type !== type) return r;

              if (r.active) {
                return { ...r, active: false, count: Math.max(0, r.count - 1) };
              }
              return { ...r, active: true, count: r.count + 1 };
            });

            const updatedFeedbacks = state.video.feedbacks
              .filter((f) => f.timestamp !== state.activeTimestamp)
              .concat({
                ...feedback,
                reactions: updatedReactions,
              })
              .sort((a, b) => a.timestamp - b.timestamp);

            return {
              video: { ...state.video, feedbacks: updatedFeedbacks },
            };
          },
          false,
          'videoFeedback/toggleReaction',
        );
      },

      setComments: (comments) => {
        set(
          (state) => {
            if (!state.video) return state;

            // CHANGED: activeTimestamp 기준
            const feedback = state.video.feedbacks.find(
              (f) => f.timestamp === state.activeTimestamp,
            );
            if (!feedback) return state;

            const updatedFeedbacks = state.video.feedbacks.map((f) =>
              f.timestamp === state.activeTimestamp ? { ...f, comments } : f,
            );

            return {
              video: { ...state.video, feedbacks: updatedFeedbacks },
            };
          },
          false,
          'videoFeedback/setComments',
        );
      },
    }),
    { name: 'VideoFeedbackStore' },
  ),
);
