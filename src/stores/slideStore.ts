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

import type { HistoryItem } from '@/types/script';
import type { Slide } from '@/types/slide';
import { addReplyToFlat, deleteFromFlat } from '@/utils/comment';

interface SlideState {
  slide: Slide | null;

  /**
   * 슬라이드 데이터를 초기화합니다.
   * @param slide - 초기화할 슬라이드 데이터
   */
  initSlide: (slide: Slide) => void;

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
                  author: '나',
                }),
              },
            };
          },
          false,
          'slide/addReply',
        );
      },
    }),
    { name: 'SlideStore' },
  ),
);
