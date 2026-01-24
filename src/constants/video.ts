/**
 * @file video.ts
 * @description 비디오 피드백 관련 상수
 */

/**
 * 리액션/댓글의 타임스탬프 그룹화 윈도우 (초)
 * - 현재 시간 ± FEEDBACK_WINDOW 범위의 피드백을 하나의 그룹으로 처리
 */
export const FEEDBACK_WINDOW = 5;
