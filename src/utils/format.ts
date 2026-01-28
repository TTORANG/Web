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

/**
 * 영상 타임스탬프: 초(seconds)를 유튜브처럼 표시(m:ss 또는 h:mm:ss)로 반환합니다.
 * 유효하지 않은 숫자이거나 0 미만인 경우 "0:00"을 반환합니다.
 *
 * 예) 90 -> "1:30", 115 -> "1:55", 3670 -> "1:01:10"
 *
 * @param seconds - 포맷팅할 초 단위 시간
 * @returns 영상 타임스탬프 문자열
 */
export function formatVideoTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');

  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

/**
 * 타임스탬프 문자열(m:ss 또는 h:mm:ss)을 초 단위로 파싱합니다.
 * 유효하지 않은 형식인 경우 null을 반환합니다.
 *
 * 예) "1:30" -> 90, "1:01:10" -> 3670
 *
 * @param timestamp - 파싱할 타임스탬프 문자열
 * @returns 초 단위 숫자 또는 null
 */
export function parseVideoTimestamp(timestamp: string): number | null {
  const trimmed = timestamp.trim();
  const parts = trimmed.split(':').map(Number);

  if (parts.some((p) => !Number.isFinite(p) || p < 0)) return null;

  if (parts.length === 2) {
    // m:ss
    const [m, s] = parts;
    if (s >= 60) return null;
    return m * 60 + s;
  }

  if (parts.length === 3) {
    // h:mm:ss
    const [h, m, s] = parts;
    if (m >= 60 || s >= 60) return null;
    return h * 3600 + m * 60 + s;
  }

  return null;
}

/**
 * 댓글 텍스트에서 앞에 붙은 타임스탬프를 파싱합니다.
 * 타임스탬프가 있으면 { seconds, content }를, 없으면 null을 반환합니다.
 *
 * 예) "1:30 안녕하세요" -> { seconds: 90, content: "안녕하세요" }
 *     "안녕하세요" -> null
 *
 * @param text - 파싱할 댓글 텍스트
 * @returns 파싱 결과 또는 null
 */
export function extractTimestampFromComment(
  text: string,
): { seconds: number; content: string } | null {
  // 앞에 타임스탬프 패턴 (m:ss 또는 h:mm:ss) + 공백
  const match = text.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)$/s);

  if (!match) return null;

  const [, timestampStr, content] = match;
  const seconds = parseVideoTimestamp(timestampStr);

  if (seconds === null) return null;

  return { seconds, content: content.trim() };
}
