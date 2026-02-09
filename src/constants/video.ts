/**
 * @file video.ts
 * @description 비디오 피드백 관련 상수
 */

/**
 * 리액션/댓글의 타임스탬프 그룹화 윈도우 (초)
 * - 현재 시간 ± FEEDBACK_WINDOW 범위의 피드백을 하나의 그룹으로 처리
 */
export const FEEDBACK_WINDOW = 2;

/**
 * 리액션 토글 타임스탬프 잠금 윈도우 (ms)
 * - 첫 토글 후 이 시간 내의 동일 emojiType 토글은 같은 timestampMs를 사용
 * - 서버가 동일 레코드를 찾아 isDeleted를 정상 토글하도록 보장
 */
export const REACTION_TOGGLE_WINDOW = 2000;
