export type ScriptReadingSpeedPresetId = 'slow' | 'normal' | 'fast';

export interface ScriptReadingSpeedOption {
  id: ScriptReadingSpeedPresetId;
  label: string;
  charsPerMinute: number;
}

export const SCRIPT_READING_SPEED_STORAGE_KEY = 'ttorang-script-reading-speed';
export const SCRIPT_READING_SPEED_MIN = 200;
export const SCRIPT_READING_SPEED_MAX = 400;
export const DEFAULT_SCRIPT_READING_SPEED = 300;

export const SCRIPT_READING_SPEED_OPTIONS: ScriptReadingSpeedOption[] = [
  {
    id: 'slow',
    label: '느리게 (분당 240자)',
    charsPerMinute: 240,
  },
  {
    id: 'normal',
    label: '보통 (분당 300자)',
    charsPerMinute: 300,
  },
  {
    id: 'fast',
    label: '빠르게 (분당 360자)',
    charsPerMinute: 360,
  },
];

const speedOptionMap = new Map<ScriptReadingSpeedPresetId, ScriptReadingSpeedOption>(
  SCRIPT_READING_SPEED_OPTIONS.map((option) => [option.id, option]),
);

const speedOptionByCharsPerMinute = new Map<number, ScriptReadingSpeedOption>(
  SCRIPT_READING_SPEED_OPTIONS.map((option) => [option.charsPerMinute, option]),
);

const DEFAULT_SCRIPT_READING_SPEED_OPTION = speedOptionByCharsPerMinute.get(
  DEFAULT_SCRIPT_READING_SPEED,
)!;

/**
 * 읽기 속도 값을 200~400 정수 범위로 정규화합니다.
 */
export function normalizeScriptReadingSpeed(speed?: number | string | null): number {
  const parsed = typeof speed === 'string' ? Number(speed) : speed;
  if (!Number.isFinite(parsed)) return DEFAULT_SCRIPT_READING_SPEED;
  const rounded = Math.round(parsed);
  return Math.min(SCRIPT_READING_SPEED_MAX, Math.max(SCRIPT_READING_SPEED_MIN, rounded));
}

/**
 * 프리셋 ID에 해당하는 옵션을 조회합니다.
 */
export function getScriptReadingSpeedOption(speedId?: string | null): ScriptReadingSpeedOption {
  if (!speedId) return DEFAULT_SCRIPT_READING_SPEED_OPTION;
  return (
    speedOptionMap.get(speedId as ScriptReadingSpeedPresetId) ?? DEFAULT_SCRIPT_READING_SPEED_OPTION
  );
}

/**
 * 현재 속도와 정확히 일치하는 프리셋이 있을 때만 반환합니다.
 */
export function getScriptReadingSpeedPreset(
  speed?: number | string | null,
): ScriptReadingSpeedOption | null {
  const normalizedSpeed = normalizeScriptReadingSpeed(speed);
  return speedOptionByCharsPerMinute.get(normalizedSpeed) ?? null;
}

/**
 * 대본 길이 계산 시 공백(띄어쓰기, 줄바꿈, 탭)은 제외합니다.
 */
export const countScriptReadableCharacters = (script: string) => script.replace(/\s+/g, '').length;

export function estimateScriptDurationSeconds(script: string, charsPerMinute: number): number {
  if (!Number.isFinite(charsPerMinute) || charsPerMinute <= 0) return 0;

  const readableCharacters = countScriptReadableCharacters(script);
  if (readableCharacters < 1) return 0;

  return Math.ceil((readableCharacters * 60) / charsPerMinute);
}

export function estimateScriptsDurationSeconds(scripts: string[], charsPerMinute: number): number {
  if (!Number.isFinite(charsPerMinute) || charsPerMinute <= 0) return 0;

  const totalReadableCharacters = scripts.reduce(
    (sum, script) => sum + countScriptReadableCharacters(script),
    0,
  );

  if (totalReadableCharacters < 1) return 0;
  return Math.ceil((totalReadableCharacters * 60) / charsPerMinute);
}

export function formatScriptDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0초';

  const safeSeconds = Math.round(seconds);
  if (safeSeconds < 60) return `${safeSeconds}초`;

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}분 ${remainingSeconds}초`;
}
