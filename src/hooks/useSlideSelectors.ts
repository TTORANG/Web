/**
 * 슬라이드 스토어 셀렉터 훅
 *
 * 필요한 상태만 구독하여 불필요한 리렌더링을 방지합니다.
 */
import { useShallow } from 'zustand/shallow';

import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import type { History, Reaction } from '@/types/script';

// 빈 배열 상수 (참조 안정성을 위해)
const EMPTY_OPINIONS: Comment[] = [];
const EMPTY_HISTORY: History[] = [];
const EMPTY_EMOJIS: Reaction[] = [];

/** 슬라이드 ID 구독 */
export const useSlideId = () => useSlideStore((state) => state.slide?.id ?? '');

/** 슬라이드 제목 구독 */
export const useSlideTitle = () => useSlideStore((state) => state.slide?.title ?? '');

/** 슬라이드 썸네일 구독 */
export const useSlideThumb = () => useSlideStore((state) => state.slide?.thumb ?? '');

/** 슬라이드 대본 구독 */
export const useSlideScript = () => useSlideStore((state) => state.slide?.script ?? '');

/** 의견 목록 구독 */
export const useSlideOpinions = () =>
  useSlideStore((state) => state.slide?.opinions ?? EMPTY_OPINIONS);

/** 대본 수정 기록 구독 */
export const useSlideHistory = () =>
  useSlideStore((state) => state.slide?.history ?? EMPTY_HISTORY);

/** 이모지 반응 목록 구독 */
export const useSlideEmojis = () =>
  useSlideStore((state) => state.slide?.emojiReactions ?? EMPTY_EMOJIS);

/** 슬라이드 스토어 액션들 (참조 안정적) */
export const useSlideActions = () =>
  useSlideStore(
    useShallow((state) => ({
      initSlide: state.initSlide,
      updateSlide: state.updateSlide,
      updateScript: state.updateScript,
      saveToHistory: state.saveToHistory,
      restoreFromHistory: state.restoreFromHistory,
      deleteOpinion: state.deleteOpinion,
      addReply: state.addReply,
      setOpinions: state.setOpinions,
    })),
  );
