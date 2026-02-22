import { useMemo } from 'react';

import { useScriptReadingSpeedStore } from '@/stores/scriptReadingSpeedStore';
import {
  SCRIPT_READING_SPEED_OPTIONS,
  type ScriptReadingSpeedPresetId,
  getScriptReadingSpeedPreset,
  normalizeScriptReadingSpeed,
} from '@/utils/scriptDuration';

export function useScriptReadingSpeed() {
  const speed = useScriptReadingSpeedStore((state) => state.speed);
  const setSpeed = useScriptReadingSpeedStore((state) => state.setSpeed);

  const selectedSpeed = useMemo(() => normalizeScriptReadingSpeed(speed), [speed]);
  const selectedPreset = useMemo(() => getScriptReadingSpeedPreset(selectedSpeed), [selectedSpeed]);
  const selectedSpeedLabel = useMemo(
    () => selectedPreset?.label ?? `직접 설정 (분당 ${selectedSpeed}자)`,
    [selectedPreset, selectedSpeed],
  );

  const setSelectedPresetId = (presetId: ScriptReadingSpeedPresetId) => {
    const selectedOption = SCRIPT_READING_SPEED_OPTIONS.find((option) => option.id === presetId);
    if (!selectedOption) return;
    setSpeed(selectedOption.charsPerMinute);
  };

  return {
    speedOptions: SCRIPT_READING_SPEED_OPTIONS,
    selectedSpeed,
    selectedPreset,
    selectedSpeedLabel,
    setSelectedSpeed: setSpeed,
    setSelectedPresetId,
  };
}
