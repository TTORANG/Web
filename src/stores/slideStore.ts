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

  initSlide: (slide: SlideDetail) => void;
  updateSlide: (updates: Partial<SlideDetail>) => void;
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

      addReaction: (type) => {
        set(
          (state) => {
            if (!state.slide) return state;

            const currentReactions = state.slide.emojiReactions || [];

            return {
              slide: {
                ...state.slide,
                emojiReactions: currentReactions.map((r) =>
                  r.type === type ? { ...r, count: r.count + 1 } : r,
                ),
              },
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
