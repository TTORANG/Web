/**
 * @file sharedContent.ts
 * @description 공유 콘텐츠 관련 공통 유틸리티
 */
import type { SharedPresentationSlide } from '@/types/share';
import type { SlideDetail } from '@/types/slide';

export const SHARED_PROJECT_ID = 'shared';

export function toNumber(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function normalizeSharedSlides(rawSlides: SharedPresentationSlide[]): SlideDetail[] {
  const now = new Date().toISOString();

  return rawSlides
    .map((slide, index) => {
      const slideNum = toNumber(slide.slideNum, index + 1);
      return {
        slideId: slide.slideId,
        projectId: SHARED_PROJECT_ID,
        title: slide.title ?? `슬라이드 ${slideNum}`,
        slideNum,
        imageUrl: slide.imageUrl,
        createdAt: now,
        updatedAt: now,
        script: slide.scriptText ?? '',
      };
    })
    .sort((a, b) => a.slideNum - b.slideNum);
}
