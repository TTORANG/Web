/**
 * 슬라이드 상태 관리 스토어
 *
 * 슬라이드별 대본, 댓글, 히스토리, 이모지 반응을 관리합니다.
 * 셀렉터 패턴으로 필요한 데이터만 구독할 수 있습니다.
 *
 * @see {@link ../hooks/useSlideSelectors.ts} 커스텀 셀렉터 훅
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { getExclusiveCounterpart } from '@/constants/reaction';
import { useAuthStore } from '@/stores/authStore';
import type { Comment } from '@/types/comment';
import type { ReactionType } from '@/types/script';
import type { SlideDetail } from '@/types/slide';
import {
  addReplyToFlat,
  createComment,
  deleteFromFlat,
  findRootParentId,
  updateInFlat,
} from '@/utils/comment';

interface SlideState {
  slide: SlideDetail | null;

  initSlide: (slide: SlideDetail) => void;
  updateSlide: (updates: Partial<SlideDetail>) => void;
  updateScript: (script: string) => void;
  deleteComment: (id: string) => void;
  updateComment: (id: string, content: string) => void;
  addReply: (parentId: string, content: string) => void;
  toggleReaction: (type: ReactionType) => void;
  addComment: (content: string, slideIndex: number) => void;
  setComments: (comments: Comment[]) => void;
}

export const useSlideStore = create<SlideState>()(
  devtools(
    (set) => ({
      slide: null,

      initSlide: (slide) => {
        set({ slide }, false, 'slide/initSlide');
      },

      updateSlide: (updates) => {
        set(
          (state) => ({
            slide: state.slide ? { ...state.slide, ...updates } : null,
          }),
          false,
          'slide/updateSlide',
        );
      },

      updateScript: (script) => {
        set(
          (state) => ({
            slide: state.slide ? { ...state.slide, script } : null,
          }),
          false,
          'slide/updateScript',
        );
      },

      deleteComment: (id) => {
        set(
          (state) => ({
            slide: state.slide
              ? {
                  ...state.slide,
                  comments: deleteFromFlat(state.slide.comments ?? [], id),
                }
              : null,
          }),
          false,
          'slide/deleteComment',
        );
      },

      updateComment: (id, content) => {
        set(
          (state) => ({
            slide: state.slide
              ? {
                  ...state.slide,
                  comments: updateInFlat(state.slide.comments ?? [], id, content),
                }
              : null,
          }),
          false,
          'slide/updateComment',
        );
      },

      addReply: (parentId, content) => {
        set(
          (state) => {
            if (!state.slide) return state;

            // 항상 최상위 부모 댓글에 답글을 달도록 rootParentId를 찾음
            const rootParentId = findRootParentId(state.slide.comments ?? [], parentId);
            const currentUser = useAuthStore.getState().user;

            const { comments } = addReplyToFlat(state.slide.comments ?? [], rootParentId, {
              content,
              userId: currentUser?.id ?? 'unknown',
              userName: currentUser?.name,
              userProfileImage: currentUser?.profileImage,
            });

            return {
              slide: {
                ...state.slide,
                comments,
              },
            };
          },
          false,
          'slide/addReply',
        );
      },

      toggleReaction: (type) => {
        set(
          (state) => {
            if (!state.slide) return state;

            const currentReactions = state.slide.emojiReactions || [];
            const targetReaction = currentReactions.find((r) => r.type === type);
            const isActivating = !targetReaction?.active;

            // exclusive 그룹에서 반대 타입 찾기
            const counterpart = getExclusiveCounterpart(type);

            const newReactions = currentReactions.map((r) => {
              // 토글 대상
              if (r.type === type) {
                if (r.active) {
                  return { ...r, active: false, count: Math.max(0, r.count - 1) };
                }
                return { ...r, active: true, count: r.count + 1 };
              }

              // 활성화 시 exclusive 반대 타입 비활성화
              if (isActivating && counterpart && r.type === counterpart && r.active) {
                return { ...r, active: false, count: Math.max(0, r.count - 1) };
              }

              return r;
            });

            return {
              slide: {
                ...state.slide,
                emojiReactions: newReactions,
              },
            };
          },
          false,
          'slide/toggleReaction',
        );
      },

      addComment: (content, slideIndex) => {
        const trimmed = content.trim();
        if (!trimmed) return;
        const currentUser = useAuthStore.getState().user;

        const newComment = createComment({
          content: trimmed,
          userId: currentUser?.id ?? 'unknown',
          userName: currentUser?.name,
          userProfileImage: currentUser?.profileImage,
          ref: { kind: 'slide', index: slideIndex },
        });

        set(
          (state) => ({
            slide: state.slide
              ? {
                  ...state.slide,
                  comments: [newComment, ...(state.slide.comments ?? [])],
                }
              : null,
          }),
          false,
          'slide/addComment',
        );
      },

      setComments: (comments) => {
        set(
          (state) => ({
            slide: state.slide ? { ...state.slide, comments } : null,
          }),
          false,
          'slide/setComments',
        );
      },
    }),
    { name: 'SlideStore' },
  ),
);
