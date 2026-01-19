/**
 * @file slideStore.ts
 * @description 슬라이드 상태 관리 Zustand 스토어
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// [Merge] develop의 유저 정보와 타입을 가져오되, 필요한 타입들도 함께 가져옵니다.
import { MOCK_CURRENT_USER } from '@/mocks/users';
import type { CommentItem } from '@/types/comment';
import type { EmojiReaction, HistoryItem, ReactionType } from '@/types/script';
import type { Slide } from '@/types/slide';
import { addReplyToFlat, createComment, deleteFromFlat } from '@/utils/comment';

interface SlideState {
  slide: Slide | null;

  // 데이터를 기억하기 위한 저장소
  currentSlideIndex: number;
  globalOpinions: CommentItem[]; // [Merge] OpinionItem -> CommentItem (팀 표준)
  reactionMap: Record<number, EmojiReaction[]>;

  initSlide: (slide: Slide, slideIndex: number) => void;
  updateSlide: (updates: Partial<Slide>) => void;
  updateScript: (script: string) => void;
  saveToHistory: () => void;
  restoreFromHistory: (item: HistoryItem) => void;
  deleteOpinion: (id: string) => void;
  addReply: (parentId: string, content: string) => void;

  // [Merge] develop 표준에 맞춰 ReactionType 사용
  toggleReaction: (type: ReactionType) => void;

  addOpinion: (content: string, slideIndex: number) => void;
  setOpinions: (opinions: CommentItem[]) => void;
}

export const useSlideStore = create<SlideState>()(
  devtools(
    (set) => ({
      slide: null,
      currentSlideIndex: 0,
      globalOpinions: [],
      reactionMap: {},

      initSlide: (slide, slideIndex) => {
        set(
          (state) => {
            // 1. 댓글 복원 (globalOpinions 우선)
            let opinionsToUse = state.globalOpinions;
            if (state.globalOpinions.length === 0) {
              opinionsToUse = slide.opinions || [];
            }

            // 2. 이모지 복원 (reactionMap 우선)
            const savedReactions = state.reactionMap[slideIndex];
            const reactionsToUse = savedReactions || slide.emojiReactions || [];

            // 3. Map 초기화
            const nextReactionMap = { ...state.reactionMap };
            if (!savedReactions) {
              nextReactionMap[slideIndex] = reactionsToUse;
            }

            return {
              currentSlideIndex: slideIndex,
              globalOpinions: opinionsToUse,
              reactionMap: nextReactionMap,
              slide: {
                ...slide,
                opinions: opinionsToUse,
                emojiReactions: reactionsToUse,
              },
            };
          },
          false,
          'slide/initSlide',
        );
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

      saveToHistory: () => {
        set(
          (state) => {
            if (!state.slide || !state.slide.script.trim()) return state;

            const historyItem: HistoryItem = {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              content: state.slide.script,
            };

            return {
              slide: {
                ...state.slide,
                history: [historyItem, ...state.slide.history],
              },
            };
          },
          false,
          'slide/saveToHistory',
        );
      },

      restoreFromHistory: (item) => {
        set(
          (state) => ({
            slide: state.slide ? { ...state.slide, script: item.content } : null,
          }),
          false,
          'slide/restoreFromHistory',
        );
      },

      deleteOpinion: (id) => {
        set(
          (state) => {
            const newOpinions = deleteFromFlat(state.globalOpinions, id);
            return {
              globalOpinions: newOpinions,
              slide: state.slide ? { ...state.slide, opinions: newOpinions } : null,
            };
          },
          false,
          'slide/deleteOpinion',
        );
      },

      // [Merge] 작성자님 로직(globalOpinions) + develop 데이터(MOCK_CURRENT_USER)
      addReply: (parentId, content) => {
        set(
          (state) => {
            const newOpinions = addReplyToFlat(state.globalOpinions, parentId, {
              content,
              authorId: MOCK_CURRENT_USER.id, // 팀 표준 유저 ID 사용
            });
            return {
              globalOpinions: newOpinions, // 영구 저장소 업데이트
              slide: state.slide ? { ...state.slide, opinions: newOpinions } : null, // 화면 업데이트
            };
          },
          false,
          'slide/addReply',
        );
      },

      // [Merge] 작성자님 로직(reactionMap) + develop 로직(type 비교)
      toggleReaction: (type) => {
        set(
          (state) => {
            if (!state.slide) return state;

            const currentReactions = state.slide.emojiReactions || [];

            // develop: type으로 비교
            const newReactions = currentReactions.map((r) => {
              if (r.type !== type) return r;

              if (r.active) {
                return { ...r, active: false, count: Math.max(0, r.count - 1) };
              }
              return { ...r, active: true, count: r.count + 1 };
            });

            // HEAD: reactionMap 업데이트 (영구 저장)
            const updatedMap = {
              ...state.reactionMap,
              [state.currentSlideIndex]: newReactions,
            };

            return {
              reactionMap: updatedMap,
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

      // [Merge] 작성자님 로직(globalOpinions) + develop 데이터(MOCK_CURRENT_USER)
      addOpinion: (content, slideIndex) => {
        const trimmed = content.trim();
        if (!trimmed) return;

        const newComment = createComment({
          content: trimmed,
          authorId: MOCK_CURRENT_USER.id, // 팀 표준 유저 ID 사용
          slideRef: `슬라이드 ${slideIndex + 1}`,
        });

        set(
          (state) => {
            const newOpinions = [newComment, ...state.globalOpinions];
            return {
              globalOpinions: newOpinions,
              slide: state.slide ? { ...state.slide, opinions: newOpinions } : null,
            };
          },
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
