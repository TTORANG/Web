/**
 * @file slideTitle.ts
 * @description 슬라이드 제목 렌더링 공통 유틸리티
 */

/**
 * 슬라이드 제목 표시 문자열을 반환합니다.
 *
 * - title이 존재하면 title 그대로 반환
 * - title이 없거나 공백이면 "슬라이드 N" 반환
 */
export function getSlideTitle(title: string | null | undefined, slideNum: number): string {
  if (typeof title === 'string' && title.trim().length > 0) {
    return title;
  }

  const safeSlideNum = Number.isFinite(slideNum) && slideNum > 0 ? Math.floor(slideNum) : 1;
  return `슬라이드 ${safeSlideNum}`;
}
