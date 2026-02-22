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

export default function ScriptBoxContent() {
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const script = useSlideScript();
  const { updateScript } = useSlideActions();
  const { autoSave, flushSave } = useAutoSaveScript();
  const { selectedSpeed } = useScriptReadingSpeed();

  const estimatedDuration = useMemo(() => {
    const durationSeconds = estimateScriptDurationSeconds(script, selectedSpeed);
    return formatScriptDuration(durationSeconds);
  }, [script, selectedSpeed]);

  const handleChange = (value: string) => {
    updateScript(value);
    autoSave(value);
  };

  return (
    <>
      <div className="relative h-full bg-white px-4 pt-3 pb-6">
        <textarea
          value={script}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={flushSave}
          placeholder="슬라이드 대본을 입력하세요..."
          aria-label="슬라이드 대본"
          className="h-full w-full resize-none overflow-y-auto border-none bg-transparent pb-8 pr-28 text-base leading-relaxed text-gray-800 outline-none placeholder:text-gray-600"
        />

        <div className="absolute bottom-3 right-4">
          <button
            type="button"
            onClick={() => setIsSpeedModalOpen(true)}
            aria-label={`읽기 속도 설정 열기 (현재 예상 시간 ${estimatedDuration})`}
            className="inline-flex min-h-9 items-center gap-2 rounded-md bg-white px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main"
          >
            <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold leading-4">
              {estimatedDuration}
            </span>
            <IconSetting className="size-4 shrink-0 text-gray-700" aria-hidden="true" />
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
