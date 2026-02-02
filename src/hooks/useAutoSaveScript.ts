import { useCallback, useRef } from 'react';

import { useUpdateScript } from '@/hooks/queries/useScript';
import { showToast } from '@/utils/toast';

import { useDebouncedCallback } from './useDebounce';
import { useSlideId } from './useSlideSelectors';

const AUTOSAVE_DELAY = 500;

/**
 * 대본 자동저장 훅
 *
 * 500ms debounce로 대본을 자동저장하고 Toast로 피드백을 제공합니다.
 *
 * @example
 * const { autoSave, isSaving } = useAutoSaveScript();
 *
 * const handleChange = (value: string) => {
 *   updateScript(value);
 *   autoSave(value);
 * };
 */
export function useAutoSaveScript() {
  const slideId = useSlideId();
  const { mutateAsync, isPending } = useUpdateScript();
  const lastSavedRef = useRef<string>('');

  const saveScript = useCallback(
    async (script: string) => {
      if (!slideId) return;

      // 이전 저장 값과 동일하면 스킵
      if (lastSavedRef.current === script) return;

      try {
        await mutateAsync({ slideId, data: { script } });
        lastSavedRef.current = script;
        showToast.success('저장 완료');
      } catch {
        showToast.error('저장 실패', '다시 시도해주세요.');
      }
    },
    [slideId, mutateAsync],
  );

  const autoSave = useDebouncedCallback(saveScript, AUTOSAVE_DELAY);

  return {
    autoSave,
    isSaving: isPending,
  };
}
