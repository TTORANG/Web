// hooks/useSlides.ts
import { useState } from 'react';

import { MOCK_UI_SLIDES } from '@/mocks/slides';

export function useSlides() {
  const [slides, setSlides] = useState(MOCK_UI_SLIDES);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');

  const totalSlides = slides.length;
  const currentSlide = slides[slideIndex];
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;

  const goPrev = () => {
    if (isFirst) return;
    setSlideIndex((i) => i - 1);
  };

  const goNext = () => {
    if (isLast) return;
    setSlideIndex((i) => i + 1);
  };

  const startTitleEdit = () => {
    setIsEditingTitle(true);
    setDraftTitle(currentSlide.title);
  };

  const cancelTitleEdit = () => {
    setIsEditingTitle(false);
    setDraftTitle('');
  };

  const commitTitle = () => {
    const trimmed = draftTitle.trim();
    const fallbackTitle = `슬라이드 ${slideIndex + 1}`;

    setSlides((prev) =>
      prev.map((s, i) =>
        i === slideIndex ? { ...s, title: trimmed.length > 0 ? trimmed : fallbackTitle } : s,
      ),
    );
    cancelTitleEdit();
  };

  const goToSlideRef = (slideRef: string) => {
    const match = slideRef.match(/\d+/);
    if (!match) return;

    const n = Number(match[0]);
    const idx = n - 1;

    if (Number.isNaN(idx)) return;
    if (idx < 0 || idx >= slides.length) return;

    cancelTitleEdit();
    setSlideIndex(idx);
  };

  return {
    slides,
    currentSlide,
    slideIndex,
    totalSlides,
    isFirst,
    isLast,
    isEditingTitle,
    draftTitle,
    setDraftTitle,
    goPrev,
    goNext,
    startTitleEdit,
    cancelTitleEdit,
    commitTitle,
    goToSlideRef,
  };
}
