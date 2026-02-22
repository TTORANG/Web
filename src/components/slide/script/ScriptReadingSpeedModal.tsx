import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';

import { Dropdown, Modal } from '@/components/common';
import type { DropdownItem } from '@/components/common/Dropdown';
import { useProjectScripts, useScriptReadingSpeed, useSlideId, useSlideScript } from '@/hooks';
import {
  SCRIPT_READING_SPEED_MAX,
  SCRIPT_READING_SPEED_MIN,
  estimateScriptsDurationSeconds,
  formatScriptDuration,
} from '@/utils/scriptDuration';

interface ScriptReadingSpeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScriptReadingSpeedModal({ isOpen, onClose }: ScriptReadingSpeedModalProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: projectScripts } = useProjectScripts(projectId ?? '');
  const slideId = useSlideId();
  const script = useSlideScript();
  const { speedOptions, selectedSpeed, selectedPreset, setSelectedSpeed } = useScriptReadingSpeed();

  const speedDropdownItems: DropdownItem[] = speedOptions.map((option) => ({
    id: option.id,
    label: option.label,
    selected: selectedSpeed === option.charsPerMinute,
    onClick: () => setSelectedSpeed(option.charsPerMinute),
  }));

  const scripts = useMemo(() => {
    const scriptMap = new Map<string, string>();

    (projectScripts?.scripts ?? []).forEach((scriptItem) => {
      scriptMap.set(scriptItem.slideId, scriptItem.scriptText ?? '');
    });

    if (slideId) {
      scriptMap.set(slideId, script);
    } else if (scriptMap.size < 1 && script.length > 0) {
      scriptMap.set('current', script);
    }

    return Array.from(scriptMap.values());
  }, [projectScripts, slideId, script]);

  const totalDurationSeconds = useMemo(
    () => estimateScriptsDurationSeconds(scripts, selectedSpeed),
    [scripts, selectedSpeed],
  );
  const totalDuration = useMemo(
    () => formatScriptDuration(totalDurationSeconds),
    [totalDurationSeconds],
  );
  const presetLabel = selectedPreset?.label ?? '직접 설정';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="읽기 속도 설정" size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-body-m-bold text-gray-800">프리셋</span>
          <Dropdown
            trigger={({ isOpen }) => (
              <button
                type="button"
                className={clsx(
                  'flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3',
                  isOpen && 'border-gray-400',
                )}
              >
                <span className="text-body-m-bold text-gray-800">{presetLabel}</span>
                <svg
                  className={clsx(
                    'h-4 w-4 text-gray-600 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            items={speedDropdownItems}
            className="w-full"
            menuClassName="w-full"
            ariaLabel="읽기 속도 프리셋 선택"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="script-reading-speed-slider" className="text-body-m-bold text-gray-800">
            읽기 속도: 분당 {selectedSpeed}자
          </label>
          <input
            id="script-reading-speed-slider"
            type="range"
            min={SCRIPT_READING_SPEED_MIN}
            max={SCRIPT_READING_SPEED_MAX}
            step={1}
            value={selectedSpeed}
            onChange={(event) => setSelectedSpeed(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-main"
          />
          <div className="flex items-center justify-between text-caption text-gray-600">
            <span>매우 느리게</span>
            <span>매우 빠르게</span>
          </div>
        </div>

        <div className="rounded-lg bg-gray-100 px-4 py-3">
          <p className="text-sm text-gray-600">전체 대본 예상 읽기 시간</p>
          <p className="text-body-m-bold text-gray-800">{totalDuration}</p>
        </div>

        <p className="text-sm leading-5 text-gray-600">
          예상 시간은 전체 대본의 공백을 제외한 글자 수를 기준으로 계산됩니다.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md bg-main py-3 font-bold text-white transition-colors hover:bg-main-variant2"
        >
          확인
        </button>
      </div>
    </Modal>
  );
}
