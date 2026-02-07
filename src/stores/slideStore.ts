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

import { getExclusiveCounterpart } from '@/constants/reaction';
import { MOCK_CURRENT_USER } from '@/mocks/users';
import type { Comment } from '@/types/comment';
import type { ReactionType } from '@/types/script';
import type { SlideListItem } from '@/types/slide';
import {
  addReplyToFlat,
  createComment,
  deleteFromFlat,
  findRootParentId,
  updateInFlat,
} from '@/utils/comment';

interface SlideState {
  slide: SlideListItem | null;

  initSlide: (slide: SlideListItem) => void;
  updateSlide: (updates: Partial<SlideListItem>) => void;
  updateScript: (script: string) => void;
  deleteOpinion: (id: string) => void;
  updateOpinion: (id: string, content: string) => void;
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
                  opinions: deleteFromFlat(state.slide.opinions ?? [], id),
                }
              : null,
          }),
          false,
          'slide/deleteOpinion',
        );
      },

      updateOpinion: (id, content) => {
        set(
          (state) => ({
            slide: state.slide
              ? {
                  ...state.slide,
                  opinions: updateInFlat(state.slide.opinions ?? [], id, content),
                }
              : null,
          }),
          false,
          'slide/updateOpinion',
        );
      },

      addReply: (parentId, content) => {
        set(
          (state) => {
            if (!state.slide) return state;

            // 항상 최상위 부모 댓글에 답글을 달도록 rootParentId를 찾음
            const rootParentId = findRootParentId(state.slide.opinions ?? [], parentId);

            const { comments: updatedOpinions } = addReplyToFlat(
              state.slide.opinions ?? [],
              rootParentId,
              {
                content,
                authorId: MOCK_CURRENT_USER.id,
              },
            );

            return {
              slide: {
                ...state.slide,
                opinions: addReplyToFlat(state.slide.opinions ?? [], parentId, {
                  content,
                  userId: MOCK_CURRENT_USER.id,
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

      addOpinion: (content, slideIndex) => {
        const trimmed = content.trim();
        if (!trimmed) return;

        const newComment = createComment({
          content: trimmed,
          userId: MOCK_CURRENT_USER.id,
          ref: { kind: 'slide', index: slideIndex },
        });

        set(
          (state) => ({
            slide: state.slide
              ? {
                  ...state.slide,
                  opinions: [newComment, ...(state.slide.opinions ?? [])],
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
