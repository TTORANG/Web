/**
 * @file useSlideSelectors.ts
 * @description 슬라이드 스토어의 커스텀 셀렉터 훅 모음
 *
 * Zustand 스토어에서 자주 사용하는 셀렉터들을 커스텀 훅으로 제공합니다.
 * 각 훅은 필요한 데이터만 구독하여 불필요한 리렌더링을 방지합니다.
 *
 * @example
 * ```tsx
 * // 개별 데이터만 구독 (최적화됨)
 * const title = useSlideTitle();
 * const script = useSlideScript();
 *
 * // 액션만 필요한 경우
 * const { updateScript, saveToHistory } = useSlideActions();
 * ```
 *
 * @see {@link ../stores/slideStore.ts} 원본 스토어
 */
import { useShallow } from 'zustand/shallow';

import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';
import type { History, Reaction } from '@/types/script';

// 빈 배열 상수 (참조 안정성을 위해)
const EMPTY_OPINIONS: Comment[] = [];
const EMPTY_HISTORY: History[] = [];
const EMPTY_EMOJIS: Reaction[] = [];

/**
 * 슬라이드 ID를 구독합니다.
 * @returns 현재 슬라이드 ID (없으면 빈 문자열)
 */
export const useSlideId = () => useSlideStore((state) => state.slide?.id ?? '');

/**
 * 슬라이드 제목을 구독합니다.
 * @returns 현재 슬라이드 제목 (없으면 빈 문자열)
 */
export const useSlideTitle = () => useSlideStore((state) => state.slide?.title ?? '');

/**
 * 슬라이드 썸네일을 구독합니다.
 * @returns 현재 슬라이드 썸네일 URL (없으면 빈 문자열)
 */
export const useSlideThumb = () => useSlideStore((state) => state.slide?.thumb ?? '');

/**
 * 슬라이드 대본을 구독합니다.
 * @returns 현재 슬라이드 대본 (없으면 빈 문자열)
 */
export const useSlideScript = () => useSlideStore((state) => state.slide?.script ?? '');

/**
 * 의견 목록을 구독합니다.
 * @returns 의견 배열 (없으면 빈 배열)
 */
export const useSlideOpinions = () =>
  useSlideStore((state) => state.slide?.opinions ?? EMPTY_OPINIONS);

/**
 * 대본 수정 기록을 구독합니다.
 * @returns 히스토리 배열 (없으면 빈 배열)
 */
export const useSlideHistory = () =>
  useSlideStore((state) => state.slide?.history ?? EMPTY_HISTORY);

/**
 * 이모지 반응 목록을 구독합니다.
 * @returns 이모지 반응 배열 (없으면 빈 배열)
 */
export const useSlideEmojis = () =>
  useSlideStore((state) => state.slide?.emojiReactions ?? EMPTY_EMOJIS);

/**
 * 슬라이드 스토어의 액션들을 반환합니다.
 * 액션은 참조가 안정적이므로 리렌더링을 유발하지 않습니다.
 *
 * @example
 * ```tsx
 * const { updateScript, saveToHistory, deleteOpinion } = useSlideActions();
 *
 * const handleSave = () => {
 *   saveToHistory();
 *   // 저장 완료 알림
 * };
 * ```
 */
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
