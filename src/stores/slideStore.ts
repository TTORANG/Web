import { create } from 'zustand';

import type { HistoryItem } from '@/types/script';
import type { Slide } from '@/types/slide';

function formatTimestamp(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${month}월 ${day}일 ${hours}:${minutes}`;
}

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
  deleteOpinion: (id: number) => void;

  /**
   * 의견에 답글을 추가합니다.
   * @param parentId - 원본 의견 ID
   * @param content - 답글 내용
   */
  addReply: (parentId: number, content: string) => void;
}

export const useSlideStore = create<SlideState>((set) => ({
  slide: null,

  initSlide: (slide) => {
    set({ slide });
  },

  updateSlide: (updates) => {
    set((state) => ({
      slide: state.slide ? { ...state.slide, ...updates } : null,
    }));
  },

  updateScript: (script) => {
    set((state) => ({
      slide: state.slide ? { ...state.slide, script } : null,
    }));
  },

  saveToHistory: () => {
    set((state) => {
      if (!state.slide || !state.slide.script.trim()) return state;

      const historyItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: formatTimestamp(),
        content: state.slide.script,
      };

      return {
        slide: {
          ...state.slide,
          history: [historyItem, ...state.slide.history],
        },
      };
    });
  },

  restoreFromHistory: (item) => {
    set((state) => ({
      slide: state.slide ? { ...state.slide, script: item.content } : null,
    }));
  },

  deleteOpinion: (id) => {
    set((state) => ({
      slide: state.slide
        ? {
            ...state.slide,
            opinions: state.slide.opinions.filter((o) => o.id !== id && o.parentId !== id),
          }
        : null,
    }));
  },

  addReply: (parentId, content) => {
    set((state) => {
      if (!state.slide) return state;

      const newReply = {
        id: Date.now(),
        author: '나',
        content,
        timestamp: '방금 전',
        isMine: true,
        isReply: true,
        parentId,
      };

      const parentIndex = state.slide.opinions.findIndex((o) => o.id === parentId);
      if (parentIndex === -1) return state;

      const newOpinions = [...state.slide.opinions];
      newOpinions.splice(parentIndex + 1, 0, newReply);

      return {
        slide: { ...state.slide, opinions: newOpinions },
      };
    });
  },
}));
