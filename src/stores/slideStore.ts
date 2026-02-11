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

import type { Comment } from '@/types/comment';
import type { ReactionType } from '@/types/script';
import type { SlideDetail } from '@/types/slide';
import { deleteFromFlat, updateInFlat } from '@/utils/comment';

interface SlideState {
  slide: SlideDetail | null;
  reactionHistory: Record<string, ReactionType[]>;
  reactionCounts: Record<string, Record<string, number>>;

  initSlide: (slide: SlideDetail) => void;
  updateSlide: (updates: Partial<SlideDetail>) => void;
  setReactionCounts: (slideId: string, counts: Record<string, number>) => void;
  updateScript: (script: string) => void;
  deleteComment: (id: string) => void;
  updateComment: (id: string, content: string) => void;
  addReaction: (type: ReactionType) => void;
  setComments: (comments: Comment[]) => void;
}

export const useSlideStore = create<SlideState>()(
  devtools(
    (set) => ({
      slide: null,

      reactionHistory: {},
      reactionCounts: {},

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

      setReactionCounts: (slideId, counts) => {
        set(
          (state) => ({
            reactionCounts: {
              ...state.reactionCounts,
              [slideId]: { ...counts },
            },
          }),
          false,
          'slide/setReactionCounts',
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

      addReaction: (type) => {
        set(
          (state) => {
            if (!state.slide) return state;

            const slideId = state.slide.slideId;
            const currentReactions = state.slide.emojiReactions || [];

            // 카운트 1 증가 (토글 아님, 항상 +1)
            const newReactions = currentReactions.map((r) => {
              if (r.type === type) {
                return { ...r, count: r.count + 1 };
              }
              return r;
            });

            const currentCounts = state.reactionCounts[slideId] || {};
            const newCounts = { ...currentCounts };
            newReactions.forEach((r) => {
              newCounts[r.type] = r.count;
            });

            return {
              slide: {
                ...state.slide,
                emojiReactions: newReactions,
              },
              reactionCounts: { ...state.reactionCounts, [slideId]: newCounts },
            };
          },
          false,
          'slide/addReaction',
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
