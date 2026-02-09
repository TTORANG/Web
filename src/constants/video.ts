/**
 * @file video.ts
 * @description Video feedback related constants.
 */

/**
 * Local feedback grouping window in seconds.
 * Used for optimistic active-state handling around the current playback time.
 */
export const FEEDBACK_WINDOW = 2;

/**
 * Reaction count aggregation window in seconds.
 * Reaction button counts represent totals within +/- REACTION_COUNT_WINDOW.
 */
export const REACTION_COUNT_WINDOW = 5;

/**
 * Reaction timeline aggregation interval in milliseconds.
 * Used as the bucket size for the reaction timeline API.
 */
export const REACTION_TIMELINE_INTERVAL_MS = 5000;
