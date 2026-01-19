/**
 * @file videoFeedbackStore.ts
 * @description 영상 피드백 상태 관리 Zustand 스토어
 *
 * 영상의 타임스탬프별 댓글과 리액션을 관리합니다.
 * slideStore와 유사한 구조로 현재 타임스탬프의 피드백을 관리합니다.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { MOCK_CURRENT_USER } from '@/mocks/users';
import type { CommentItem } from '@/types/comment';
import type { ReactionType } from '@/types/script';
import type { VideoFeedback, VideoTimestampFeedback } from '@/types/video';
import { addReplyToFlat, createComment, deleteFromFlat } from '@/utils/comment';

interface VideoFeedbackState {
  video: VideoFeedback | null;
  /** 현재 활성 타임스탐프 (초 단위) */
  currentTimestamp: number;

  /**
   * 영상 데이터를 초기화합니다.
   */
  initVideo: (video: VideoFeedback) => void;

  /**
   * 현재 타임스탬프를 업데이트합니다.
   * 일치하는 피드백이 없으면 새로 생성합니다.
   * @param timestamp - 영상 현재 시간 (초)
   */
  updateTimestamp: (timestamp: number) => void;

  /**
   * 현재 타임스탬프에 댓글을 추가합니다.
   */
  addComment: (content: string) => void;

  /**
   * 현재 타임스탬프의 댓글에 답글을 추가합니다.
   */
  addReply: (parentId: string, content: string) => void;

  /**
   * 댓글을 삭제합니다.
   */
  deleteComment: (commentId: string) => void;

  /**
   * 현재 타임스탬프의 리액션을 토글합니다.
   */
  toggleReaction: (type: ReactionType) => void;

  /**
   * 댓글 목록을 통째로 교체합니다. (롤백용)
   */
  setComments: (comments: CommentItem[]) => void;
}

export const useVideoFeedbackStore = create<VideoFeedbackState>()(
  devtools(
    (set) => ({
      video: null,
      currentTimestamp: 0,

      initVideo: (video) => {
        set({ video, currentTimestamp: 0 }, false, 'videoFeedback/initVideo');
      },

      updateTimestamp: (timestamp) => {
        set(
          (state) => {
            if (!state.video) return state;

            // 0.5초 단위로 반올림 (미세한 변화 무시)
            const roundedTimestamp = Math.round(timestamp * 2) / 2;

            // 이미 같은 타임스탐프면 업데이트 안함
            if (state.currentTimestamp === roundedTimestamp) return state;

            return { currentTimestamp: roundedTimestamp };
          },
          false,
          'videoFeedback/updateTimestamp',
        );
      },

      addComment: (content) => {
        set(
          (state) => {
            if (!state.video) return state;

            const trimmed = content.trim();
            if (!trimmed) return state;

            const newComment = createComment({
              content: trimmed,
              authorId: MOCK_CURRENT_USER.id,
              slideRef: `${state.currentTimestamp}초`,
            });

            // 현재 타임스탐프의 피드백 찾기
            let feedback = state.video.feedbacks.find(
              (f) => f.timestamp === state.currentTimestamp,
            );

            // 없으면 새로 생성
            if (!feedback) {
              feedback = {
                timestamp: state.currentTimestamp,
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
              .filter((f) => f.timestamp !== state.currentTimestamp)
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

            const feedback = state.video.feedbacks.find(
              (f) => f.timestamp === state.currentTimestamp,
            );
            if (!feedback) return state;

            const updatedComments = addReplyToFlat(feedback.comments, parentId, {
              content,
              authorId: MOCK_CURRENT_USER.id,
            });

            const updatedFeedbacks = state.video.feedbacks.map((f) =>
              f.timestamp === state.currentTimestamp ? { ...f, comments: updatedComments } : f,
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

            const feedback = state.video.feedbacks.find(
              (f) => f.timestamp === state.currentTimestamp,
            );
            if (!feedback) return state;

            const updatedComments = deleteFromFlat(feedback.comments, commentId);

            const updatedFeedbacks = state.video.feedbacks.map((f) =>
              f.timestamp === state.currentTimestamp ? { ...f, comments: updatedComments } : f,
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

            let feedback = state.video.feedbacks.find(
              (f) => f.timestamp === state.currentTimestamp,
            );

            // 없으면 새로 생성
            if (!feedback) {
              feedback = {
                timestamp: state.currentTimestamp,
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
              .filter((f) => f.timestamp !== state.currentTimestamp)
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

            const feedback = state.video.feedbacks.find(
              (f) => f.timestamp === state.currentTimestamp,
            );
            if (!feedback) return state;

            const updatedFeedbacks = state.video.feedbacks.map((f) =>
              f.timestamp === state.currentTimestamp ? { ...f, comments } : f,
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
