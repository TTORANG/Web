/**
 * @file reactionStorage.ts
 * @description Persist per-user reaction active state in localStorage.
 *
 * We keep one on/off state per emoji per video for the current viewer.
 * This mirrors the backend upsert/toggle behavior and prevents
 * optimistic count drift (e.g. 1 -> 2 -> 3) while playback time moves.
 */
import { REACTION_TYPES, getExclusiveCounterpart } from '@/constants/reaction';
import type { ReactionType } from '@/types/script';

type ReactionActiveMap = Partial<Record<ReactionType, boolean>>;

const STORAGE_KEY_PREFIX = 'video-reactions:';

function getStorageKey(videoId: string): string {
  return `${STORAGE_KEY_PREFIX}${videoId}`;
}

function isReactionType(value: string): value is ReactionType {
  return (REACTION_TYPES as string[]).includes(value);
}

function readActiveMap(videoId: string): ReactionActiveMap {
  try {
    const raw = localStorage.getItem(getStorageKey(videoId));
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    const record = parsed as Record<string, unknown>;
    const next: ReactionActiveMap = {};

    Object.entries(record).forEach(([key, value]) => {
      if (isReactionType(key) && typeof value === 'boolean') {
        next[key] = value;
      }
    });

    return next;
  } catch {
    return {};
  }
}

function writeActiveMap(videoId: string, map: ReactionActiveMap): void {
  try {
    localStorage.setItem(getStorageKey(videoId), JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

/**
 * Returns stored active states for one viewer and one video.
 */
export function getStoredReactions(videoId: string): Record<ReactionType, boolean> {
  const stored = readActiveMap(videoId);

  return REACTION_TYPES.reduce(
    (acc, type) => {
      acc[type] = stored[type] ?? false;
      return acc;
    },
    {} as Record<ReactionType, boolean>,
  );
}

/**
 * Persists active state and handles exclusive counterpart.
 */
export function setStoredReaction(videoId: string, type: ReactionType, active: boolean): void {
  const map = readActiveMap(videoId);
  map[type] = active;

  if (active) {
    const counterpart = getExclusiveCounterpart(type);
    if (counterpart) {
      map[counterpart] = false;
    }
  }

  writeActiveMap(videoId, map);
}
