/**
 * @file videoFeedbackStore.ts
 * @description 영상 피드백 상태 관리 Zustand 스토어

 * - 댓글의 "영상 이동 참조"는 slideRef(문자열) 대신 videoSecondsRef(숫자)로 저장
 * - 댓글은 feedback bucket(activeTimestamp)에 "보관"하되,
 *   실제 이동 링크는 currentTime(정확한 재생 위치)로 저장하여 UX 개선
 * - requestSeek / clearSeek / seekTo는 그대로 유지 (VideoViewer가 seekTo를 구독해 이동)
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
   * - currentTime: 실제 재생 시간(초). 마커(±5초 필터) 같은 "현재시점 UI" 기준
   */
  currentTime: number;

  /**
   * - activeTimestamp: 5초 단위 버킷 시간(0,5,10,15...)
   * - ReactionButtons / toggleReaction 같은 "버킷형 피드백" 저장 기준은 이 값을 씀
   */
  activeTimestamp: number;

  /**
   * seekTo: "이동 요청" (VideoViewer가 구독해서 video.currentTime 변경)
   */
  seekTo: number | null;

  initVideo: (video: VideoFeedback) => void;

  /**
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

function hasCommentId(flat: CommentItem[], id: string) {
  return flat.some((c) => c.id === id);
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

            // (기존 유지) 5초 단위 버킷 (0,5,10,15...)
            const bucket = Math.floor(roundedTime / 5) * 5;

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
      // VideoViewer가 seekTo를 구독하고, 처리 후 clearSeek()로 비움

      clearSeek: () => {
        set({ seekTo: null }, false, 'videoFeedback/clearSeek');
      },

      addComment: (content) => {
        set(
          (state) => {
            if (!state.video) return state;

            const trimmed = content.trim();
            if (!trimmed) return state;

            // - 댓글은 "버킷(activeTimestamp)"에 보관하되
            // - 댓글 클릭 시 이동할 시간은 "정확한 currentTime"으로 저장한다.
            //   (버킷으로 저장하면 5초 단위로만 점프해서 UX가 구려짐)
            const base = createComment({
              content: trimmed,
              authorId: MOCK_CURRENT_USER.id,
              // slideRef는 더 이상 쓰지 않음 (슬라이드 아이콘/문자열 꼬임 방지)
            });

            // videoSecondsRef 추가 (정확한 영상 위치)
            const newComment: CommentItem = {
              ...base,
              videoSecondsRef: state.currentTime, // 예: 256.5 같은 값도 가능
              slideRef: undefined, // 안전하게 제거
            };

            // (기존 유지) 댓글은 feedback bucket에 "보관" (데이터 구조 유지용)
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

            // (기존 유지) parentId가 들어있는 feedback을 찾아서 답글 추가
            const target = state.video.feedbacks.find((f) => hasCommentId(f.comments, parentId));
            if (!target) return state;

            const updatedComments = addReplyToFlat(target.comments, parentId, {
              content: content.trim(),
              authorId: MOCK_CURRENT_USER.id,
            });

            const updatedFeedbacks = state.video.feedbacks.map((f) =>
              f.timestamp === target.timestamp ? { ...f, comments: updatedComments } : f,
            );

            return { video: { ...state.video, feedbacks: updatedFeedbacks } };
          },
          false,
          'videoFeedback/addReply',
        );
      },

      deleteComment: (commentId) => {
        set(
          (state) => {
            if (!state.video) return state;

            const target = state.video.feedbacks.find((f) => hasCommentId(f.comments, commentId));
            if (!target) return state;

            const updatedComments = deleteFromFlat(target.comments, commentId);

            const updatedFeedbacks = state.video.feedbacks.map((f) =>
              f.timestamp === target.timestamp ? { ...f, comments: updatedComments } : f,
            );

            return { video: { ...state.video, feedbacks: updatedFeedbacks } };
          },
          false,
          'videoFeedback/deleteComment',
        );
      },

      toggleReaction: (type) => {
        set(
          (state) => {
            if (!state.video) return state;

            // (기존 유지) 리액션은 "버킷(activeTimestamp)" 기준이 합리적
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
