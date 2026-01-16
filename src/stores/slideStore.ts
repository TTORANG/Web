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

import { MOCK_CURRENT_USER } from '@/mocks/users';
import type { CommentItem } from '@/types/comment';
import type { HistoryItem, ReactionType } from '@/types/script';
import type { Slide } from '@/types/slide';
import { addReplyToFlat, createComment, deleteFromFlat } from '@/utils/comment';

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

  // 이모지 토글 액션을 정의합니다.
  toggleReaction: (type: ReactionType) => void;

  // 새 루트 댓글 작성 액션
  addOpinion: (content: string, slideIndex: number) => void;

  /**
   * 의견 목록을 통째로 교체합니다.
   * (Optimistic UI 롤백용)
   * @param opinions - 교체할 의견 목록
   */
  setOpinions: (opinions: CommentItem[]) => void;
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
            // 슬라이드가 없거나 리액션 배열이 없으면 무시
            if (!state.slide) return state;

            const currentReactions = state.slide.emojiReactions || [];

            // 해당 타입 찾아서 업데이트
            const newReactions = currentReactions.map((r) => {
              if (r.type !== type) return r;

              // 활성 -> 비활성 (카운트 감소)
              if (r.active) {
                return { ...r, active: false, count: Math.max(0, r.count - 1) };
              }
              // 비활성 -> 활성 (카운트 증가)
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
          'slide/toggleReaction', // DevTools 액션 이름
        );
      },

      addOpinion: (content, slideIndex) => {
        const trimmed = content.trim();
        if (!trimmed) return;

        const newComment = createComment({
          content: trimmed,
          authorId: MOCK_CURRENT_USER.id, // 혹은 로그인된 유저 정보
          slideRef: `슬라이드 ${slideIndex + 1}`,
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
