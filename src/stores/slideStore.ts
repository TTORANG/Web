/**
 * 슬라이드 상태 관리 스토어
 *
 * 슬라이드별 대본, 의견, 히스토리, 이모지 반응을 관리합니다.
 * 셀렉터 패턴으로 필요한 데이터만 구독할 수 있습니다.
 *
 * @see {@link ../hooks/useSlideSelectors.ts} 커스텀 셀렉터 훅
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { MOCK_CURRENT_USER } from '@/mocks/users';
import type { Comment } from '@/types/comment';
import type { ReactionType } from '@/types/script';
import type { Slide } from '@/types/slide';
import { addReplyToFlat, createComment, deleteFromFlat } from '@/utils/comment';

interface SlideState {
  slide: Slide | null;

  initSlide: (slide: Slide) => void;
  updateSlide: (updates: Partial<Slide>) => void;
  updateScript: (script: string) => void;
  deleteOpinion: (id: string) => void;
  addReply: (parentId: string, content: string) => void;
  toggleReaction: (type: ReactionType) => void;
  addOpinion: (content: string, slideIndex: number) => void;
  setOpinions: (opinions: Comment[]) => void;
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

      deleteOpinion: (id) => {
        set(
          (state) => ({
            slide: state.slide
              ? {
                  ...state.slide,
                  opinions: deleteFromFlat(state.slide.opinions, id),
                }
              : null,
          }),
          false,
          'slide/deleteOpinion',
        );
      },

      addReply: (parentId, content) => {
        set(
          (state) => {
            if (!state.slide) return state;

            return {
              slide: {
                ...state.slide,
                opinions: addReplyToFlat(state.slide.opinions, parentId, {
                  content,
                  authorId: MOCK_CURRENT_USER.id,
                }),
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
            const newReactions = currentReactions.map((r) => {
              if (r.type !== type) return r;

              if (r.active) {
                return { ...r, active: false, count: Math.max(0, r.count - 1) };
              }
              return { ...r, active: true, count: r.count + 1 };
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

      addOpinion: (content, slideIndex) => {
        const trimmed = content.trim();
        if (!trimmed) return;

        const newComment = createComment({
          content: trimmed,
          authorId: MOCK_CURRENT_USER.id,
          ref: { kind: 'slide', index: slideIndex },
        });

        set(
          (state) => ({
            slide: state.slide
              ? {
                  ...state.slide,
                  opinions: [newComment, ...state.slide.opinions],
                }
              : null,
          }),
          false,
          'slide/addOpinion',
        );
      },

      setOpinions: (opinions) => {
        set(
          (state) => ({
            slide: state.slide ? { ...state.slide, opinions } : null,
          }),
          false,
          'slide/setOpinions',
        );
      },
    }),
    { name: 'SlideStore' },
  ),
);
