/**
 * @file video.ts
 * @description 비디오 피드백 관련 유틸리티 함수
 */

/**
 * 현재 재생 시간에 해당하는 슬라이드 인덱스를 계산
 *
 * @param currentTime - 현재 재생 시간 (초)
 * @param changeTimes - 슬라이드 전환 시간 배열 (오름차순)
 * @param maxIndex - 최대 인덱스 (슬라이드 개수 - 1), 결과 클램핑용
 * @returns 현재 시간에 해당하는 슬라이드 인덱스
 *
 * @example
 * // changeTimes = [0, 12, 24, 38] 일 때
 * getSlideIndexFromTime(15, changeTimes) // 1 (12초 슬라이드)
 * getSlideIndexFromTime(0, changeTimes)  // 0
 * getSlideIndexFromTime(50, changeTimes) // 3
 */
export function getSlideIndexFromTime(
  currentTime: number,
  changeTimes: number[],
  maxIndex?: number,
): number {
  let idx = 0;

  for (let i = 0; i < changeTimes.length; i += 1) {
    if (changeTimes[i] <= currentTime) {
      idx = i;
    } else {
      break;
    }
  }

  // maxIndex가 주어지면 클램핑
  if (maxIndex !== undefined) {
    return Math.max(0, Math.min(idx, maxIndex));
  }

  return idx;
}

/**
 * 숫자를 min, max 범위로 클램핑
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
