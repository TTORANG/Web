import { useCallback, useEffect, useRef } from 'react';

import { useUpdateScript } from '@/hooks/queries/useScript';
import { showToast } from '@/utils/toast';

import { useDebouncedCallback } from './useDebounce';
import { useSlideId, useSlideProjectId } from './useSlideSelectors';

const AUTOSAVE_DELAY = 300;

/**
 * 대본 자동저장 훅
 *
 * 300ms debounce로 대본을 자동저장하고 Toast로 피드백을 제공합니다.
 *
 * @example
 * const { autoSave, flushSave, isSaving } = useAutoSaveScript();
 *
 * const handleChange = (value: string) => {
 *   updateScript(value);
 *   autoSave(value);
 * };
 */
export function useAutoSaveScript() {
  const slideId = useSlideId();
  const projectId = useSlideProjectId();
  const { mutateAsync, isPending } = useUpdateScript();
  const lastSavedRef = useRef<string>('');
  const pendingScriptRef = useRef<string | null>(null);
  const isSavingRef = useRef(false);
  const activeSlideIdRef = useRef(slideId);

  const flushPendingSave = useCallback(async () => {
    if (!slideId || isSavingRef.current) return;

    const scriptToSave = pendingScriptRef.current;

    // 저장할 내용이 없거나 이미 서버에 반영된 값이면 스킵
    if (scriptToSave === null || scriptToSave === lastSavedRef.current) return;

    isSavingRef.current = true;
    let saveSucceeded = false;
    try {
      await mutateAsync({ slideId, projectId, data: { script: scriptToSave } });

      if (activeSlideIdRef.current !== slideId) return;

      saveSucceeded = true;
      lastSavedRef.current = scriptToSave;

      if (pendingScriptRef.current === scriptToSave) {
        pendingScriptRef.current = null;
        showToast.success('대본을 저장했습니다.', '작성 내용이 자동으로 반영되었습니다.');
      }
    } catch {
      showToast.error('대본을 저장하지 못했습니다.', '다시 시도해주세요.');
    } finally {
      isSavingRef.current = false;
    }

    const nextPending = pendingScriptRef.current;
    if (saveSucceeded && nextPending !== null && nextPending !== lastSavedRef.current) {
      void flushPendingSave();
    }
  }, [slideId, projectId, mutateAsync]);

  const scheduleFlush = useDebouncedCallback(() => {
    void flushPendingSave();
  }, AUTOSAVE_DELAY);

  const autoSave = useCallback(
    (script: string) => {
      if (!slideId) return;

      pendingScriptRef.current = script;

      // 이전 저장 값과 동일하면 스킵
      if (lastSavedRef.current === script) {
        pendingScriptRef.current = null;
        return;
      }

      scheduleFlush();
    },
    [slideId, scheduleFlush],
  );

  useEffect(() => {
    // 슬라이드 전환 시 이전 슬라이드 저장 상태를 초기화
    activeSlideIdRef.current = slideId;
    lastSavedRef.current = '';
    pendingScriptRef.current = null;
    isSavingRef.current = false;
  }, [slideId]);

  useEffect(() => {
    const handleOnline = () => {
      void flushPendingSave();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [flushPendingSave]);

  const flushSave = useCallback(() => {
    void flushPendingSave();
  }, [flushPendingSave]);

  return {
    autoSave,
    flushSave,
    isSaving: isPending,
  };
}
