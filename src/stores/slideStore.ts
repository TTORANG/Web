/**
 * @file slideStore.ts
 * @description 슬라이드 상태 관리 Zustand 스토어
 *
 * 슬라이드별 대본, 의견, 히스토리, 이모지 반응을 관리합니다.
 * 셀렉터 패턴을 사용하여 필요한 데이터만 구독할 수 있습니다.
 *
 * @example 기본 사용법
 * ```tsx
 * // 컴포넌트에서 셀렉터로 구독 (권장)
 * const title = useSlideStore((s) => s.slide?.title ?? '');
 * const updateScript = useSlideStore((s) => s.updateScript);
 *
 * // 또는 커스텀 훅 사용 (더 간편)
 * import { useSlideTitle, useSlideActions } from '@/hooks/useSlideSelectors';
 * const title = useSlideTitle();
 * const { updateScript } = useSlideActions();
 * ```
 *
 * @example 슬라이드 초기화 (SlideWorkspace에서)
 * ```tsx
 * const initSlide = useSlideStore((s) => s.initSlide);
 *
 * useEffect(() => {
 *   initSlide(slide);
 * }, [slide, initSlide]);
 * ```
 *
 * @see {@link ../hooks/useSlideSelectors.ts} 커스텀 셀렉터 훅
 * @see {@link ../types/slide.ts} Slide 타입 정의
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { EmojiReaction, HistoryItem, OpinionItem } from '@/types/script';
import type { Slide } from '@/types/slide';
import { addReplyToFlat, createComment, deleteFromFlat } from '@/utils/comment';

interface SlideState {
  slide: Slide | null;

  // 데이터를 기억하기 위한 저장소
  currentSlideIndex: number;
  globalOpinions: OpinionItem[]; // 전체 댓글 유지용
  reactionMap: Record<number, EmojiReaction[]>; // 슬라이드별 이모지 상태 유지용

  /**
   * 슬라이드 데이터를 초기화합니다.
   * @param slide - 초기화할 슬라이드 데이터
   */
  initSlide: (slide: Slide, slideIndex: number) => void;

  /**
   * 슬라이드 데이터를 부분 업데이트합니다.
   * @param updates - 업데이트할 필드들
   */
  updateSlide: (updates: Partial<Slide>) => void;

  /**
   * 대본 내용을 업데이트합니다.
   * @param script - 새로운 대본 내용
   */
  updateScript: (script: string) => void;

  /**
   * 현재 대본을 히스토리에 저장합니다.
   * 대본이 비어있으면 저장하지 않습니다.
   */
  saveToHistory: () => void;

  /**
   * 특정 시점의 대본으로 복원합니다.
   * @param item - 복원할 히스토리 아이템
   */
  restoreFromHistory: (item: HistoryItem) => void;

  /**
   * 의견을 삭제합니다.
   * 해당 의견의 대댓글도 함께 제거됩니다.
   * @param id - 삭제할 의견 ID
   */
  deleteOpinion: (id: string) => void;

  /**
   * 의견에 답글을 추가합니다.
   * @param parentId - 원본 의견 ID
   * @param content - 답글 내용
   */
  addReply: (parentId: string, content: string) => void;

  // 이모지 토글 액션을 정의합니다.
  toggleReaction: (emoji: string) => void;

  // 새 루트 댓글 작성 액션
  addOpinion: (content: string, slideIndex: number) => void;
}

export const useSlideStore = create<SlideState>()(
  devtools(
    (set) => ({
      slide: null,
      // 초기 상태값
      currentSlideIndex: 0,
      globalOpinions: [],
      reactionMap: {},

      initSlide: (slide, slideIndex) => {
        set(
          (state) => {
            // 1. 댓글 복원 로직
            // 스토어에 저장된 댓글이 있으면 그걸 쓰고, 없으면(첫 진입) 들어온 slide.opinions 사용
            let opinionsToUse = state.globalOpinions;
            if (state.globalOpinions.length === 0) {
              opinionsToUse = slide.opinions || [];
            }

            // 2. 이모지 복원 로직
            // 이 슬라이드 번호(Index)에 저장된 이모지가 있으면 그걸 쓰고, 없으면 들어온 것 사용
            const savedReactions = state.reactionMap[slideIndex];
            const reactionsToUse = savedReactions || slide.emojiReactions || [];

            // 3. Map에 현재 상태가 없으면 초기값 등록해두기
            const nextReactionMap = { ...state.reactionMap };
            if (!savedReactions) {
              nextReactionMap[slideIndex] = reactionsToUse;
            }

            return {
              currentSlideIndex: slideIndex,
              globalOpinions: opinionsToUse, // 상태 동기화
              reactionMap: nextReactionMap, // 맵 업데이트
              slide: {
                ...slide,
                opinions: opinionsToUse, // 복원된 댓글 적용
                emojiReactions: reactionsToUse, // 복원된 이모지 적용
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
            // 슬라이드가 없거나 대본이 비어있으면 저장하지 않음
            if (!state.slide || !state.slide.script.trim()) return state;

            const historyItem: HistoryItem = {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              content: state.slide.script,
            };

            // 새 히스토리를 맨 앞에 추가 (최신순 정렬)
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
              globalOpinions: newOpinions, // 영구 저장소 업데이트
              slide: state.slide ? { ...state.slide, opinions: newOpinions } : null, // 현재 화면 업데이트
            };
          },
          false,
          'slide/deleteOpinion',
        );
      },

      addReply: (parentId, content) => {
        set(
          (state) => {
            const newOpinions = addReplyToFlat(state.globalOpinions, parentId, {
              content,
              author: '나',
            });
            return {
              globalOpinions: newOpinions,
              slide: state.slide ? { ...state.slide, opinions: newOpinions } : null,
            };
          },
          false,
          'slide/addReply',
        );
      },

      toggleReaction: (emoji) => {
        set(
          (state) => {
            if (!state.slide) return state;

            const currentReactions = state.slide.emojiReactions || [];
            const newReactions = currentReactions.map((r) => {
              if (r.emoji !== emoji) return r;
              if (r.active) return { ...r, active: false, count: Math.max(0, r.count - 1) };
              return { ...r, active: true, count: r.count + 1 };
            });

            // 현재 슬라이드 번호에 맞는 맵 업데이트
            const updatedMap = {
              ...state.reactionMap,
              [state.currentSlideIndex]: newReactions,
            };

            return {
              reactionMap: updatedMap, // 맵에 저장 (다른 슬라이드 갔다 와도 유지됨)
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
          author: '익명', // 혹은 로그인된 유저 정보
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
    }),
    { name: 'SlideStore' },
  ),
);
