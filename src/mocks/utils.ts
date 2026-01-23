import dayjs, { type ManipulateType } from '@/utils/dayjs';

/**
 * n일 전 날짜를 ISO 문자열로 반환
 * @param days - 며칠 전인지 (예: 1)
 */
export const daysAgo = (days: number) => dayjs().subtract(days, 'day').toISOString();

/**
 * n(unit) 전 날짜를 ISO 문자열로 반환
 * @param value - 값 (예: 2)
 * @param unit - 단위 (예: 'minute', 'hour')
 */
export const timeAgo = (value: number, unit: ManipulateType) =>
  dayjs().subtract(value, unit).toISOString();

/**
 * n일 전 특정 시간의 날짜를 ISO 문자열로 반환
 * @param daysAgo - 며칠 전인지
 * @param hour - 시 (0-23)
 * @param minute - 분 (0-59)
 */
export const timeAt = (daysAgo: number, hour: number, minute: number) =>
  dayjs().subtract(daysAgo, 'day').hour(hour).minute(minute).toISOString();
