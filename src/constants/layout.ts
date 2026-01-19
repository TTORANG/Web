/**
 * @file layout.ts
 * @description 레이아웃 관련 상수
 */

/** 헤더 높이 */
export const HEADER_HEIGHT = '3.75rem'; // 60px

/** ScriptBox 높이 설정 */
export const SCRIPT_BOX = {
  /** 접힌 상태 높이 */
  COLLAPSED: '2.5rem', // 40px
  /** 최소 높이 */
  MIN: '12rem', // 192px
  /** 선호 높이 */
  PREFERRED: '30vh',
  /** 최대 높이 */
  MAX: '20rem', // 320px
} as const;

/** ScriptBox 접힘 시 슬라이드 이동 오프셋 (px) */
export const SLIDE_COLLAPSED_OFFSET = 140;

/**
 * 슬라이드 최대 너비 계산식
 *
 * 화면 높이에서 헤더, ScriptBox, 여백을 뺀 영역에 16:9 비율 적용
 */
export const SLIDE_MAX_WIDTH = `min(2200px, calc((100dvh - ${HEADER_HEIGHT} - ${SCRIPT_BOX.MAX} - 3rem) * 16 / 9))`;
