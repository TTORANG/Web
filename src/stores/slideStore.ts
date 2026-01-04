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

  // 초기화
  initSlide: (slide: Slide) => void;

  // 일반 업데이트
  updateSlide: (updates: Partial<Slide>) => void;

  // 대본 관련
  updateScript: (script: string) => void;
  saveToHistory: () => void;
  restoreFromHistory: (item: HistoryItem) => void;

  // 의견 관련
  deleteOpinion: (id: number) => void;
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
