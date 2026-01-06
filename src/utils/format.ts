/**
 * @file format.ts
 * @description 포맷팅 유틸리티 함수
 */
import dayjs from '@/utils/dayjs';

/**
 * 날짜를 "M월 D일 HH:mm" 형식으로 반환합니다.
 *
 * @param date - 포맷팅할 날짜 (기본값: 현재 시간)
 * @returns 포맷된 타임스탬프 문자열
 *
 * @example
 * formatTimestamp() // "1월 6일 14:30"
 * formatTimestamp('2023-12-25T10:00:00') // "12월 25일 10:00"
 */
export function formatTimestamp(date?: string | Date): string {
  return dayjs(date).format('M월 D일 HH:mm');
}

/**
 * 날짜를 상대 시간(예: "방금 전", "3분 전")으로 반환합니다.
 * 유효하지 않은 날짜 문자열인 경우 원본 문자열을 그대로 반환합니다.
 *
 * @param date - 포맷팅할 날짜 문자열
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(date: string): string {
  const d = dayjs(date);
  return d.isValid() ? d.fromNow() : date;
}
