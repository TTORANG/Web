/**
 * @file ScriptBoxContent.tsx
 * @description ScriptBox 본문 영역
 *
 * 슬라이드 대본을 입력하는 텍스트 영역입니다.
 * Zustand store를 통해 대본을 읽고 업데이트하며,
 * debounce로 자동저장됩니다.
 */
import { useMemo, useState } from 'react';

import IconSetting from '@/assets/icons/icon-setting.svg?react';
import { useAutoSaveScript, useScriptReadingSpeed, useSlideActions, useSlideScript } from '@/hooks';
import { estimateScriptDurationSeconds, formatScriptDuration } from '@/utils/scriptDuration';

import ScriptReadingSpeedModal from './ScriptReadingSpeedModal';

interface ScriptBoxContentProps {
  readOnly?: boolean;
}

export default function ScriptBoxContent({ readOnly = false }: ScriptBoxContentProps) {
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const script = useSlideScript();
  const { updateScript } = useSlideActions();
  const { autoSave, flushSave, saveStatus, lastSavedAt } = useAutoSaveScript();
  const { selectedSpeed } = useScriptReadingSpeed();

  const estimatedDuration = useMemo(() => {
    const durationSeconds = estimateScriptDurationSeconds(script, selectedSpeed);
    return formatScriptDuration(durationSeconds);
  }, [script, selectedSpeed]);

  const handleChange = (value: string) => {
    if (readOnly) return;
    updateScript(value);
    autoSave(value);
  };

  const saveStatusLabel = useMemo(() => {
    if (saveStatus === 'saving') return '저장 중...';
    if (saveStatus === 'error') return '저장 실패';
    if (lastSavedAt) {
      const savedTime = new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(lastSavedAt);
      return `마지막 저장: ${savedTime}`;
    }

    return null;
  }, [saveStatus, lastSavedAt]);

  return (
    <>
      <div className="relative h-full bg-white px-4 pt-3 pb-6">
        <textarea
          value={script}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={readOnly ? undefined : flushSave}
          placeholder={readOnly ? '데모 대본 (읽기 전용)' : '슬라이드 대본을 입력하세요...'}
          aria-label="슬라이드 대본"
          readOnly={readOnly}
          className="h-full w-full resize-none overflow-y-auto border-none bg-transparent pb-10 text-base leading-relaxed text-gray-800 outline-none placeholder:text-gray-600"
        />

        {saveStatusLabel && (
          <p
            aria-live="polite"
            aria-atomic="true"
            className={`pointer-events-none absolute bottom-4 left-4 z-10 text-xs font-medium leading-4 ${
              saveStatus === 'error' ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {saveStatusLabel}
          </p>
        )}

        <div className="pointer-events-none absolute bottom-3 right-4 z-10">
          <button
            type="button"
            onClick={() => setIsSpeedModalOpen(true)}
            aria-label={`읽기 속도 설정 열기 (현재 예상 시간 ${estimatedDuration})`}
            className="pointer-events-auto inline-flex min-h-9 items-center gap-2 rounded-full bg-transparent px-0 py-1.5 text-gray-600 transition-colors hover:text-gray-700 active:text-gray-800 focus-visible:outline-2 focus-visible:outline-main disabled:pointer-events-none disabled:opacity-60"
            disabled={readOnly}
          >
            <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold leading-4">
              {estimatedDuration}
            </span>
            <IconSetting className="size-4 shrink-0 text-gray-500" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ScriptReadingSpeedModal
        isOpen={isSpeedModalOpen}
        onClose={() => setIsSpeedModalOpen(false)}
      />
    </>
  );
}
