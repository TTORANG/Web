/**
 * @file format.ts
 * @description 포맷팅 유틸리티 함수
 */

/**
 * 현재 시각을 "M월 D일 HH:mm" 형식으로 반환합니다.
 *
 * @returns 포맷된 타임스탬프 문자열
 *
 * @example
 * formatTimestamp() // "1월 6일 14:30"
 */
export function formatTimestamp(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${month}월 ${day}일 ${hours}:${minutes}`;
}
