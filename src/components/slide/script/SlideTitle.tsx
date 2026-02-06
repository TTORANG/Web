/**
 * @file SlideTitle.tsx
 * @description 슬라이드 제목 편집 팝오버
 *
 * ScriptBox 헤더에서 슬라이드 제목을 클릭하면 나타나는 편집 UI입니다.
 * Zustand store를 통해 슬라이드 제목을 읽고 업데이트합니다.
 */
import { TitleEditorPopover } from '@/components/common';
import { useSlideActions, useSlideId, useSlideTitle, useUpdateSlide } from '@/hooks';

interface SlideTitleProps {
  isCollapsed?: boolean;
  fallbackTitle?: string;
  /** 읽기 전용 모드 (편집 불가) */
  readOnly?: boolean;
}

export default function SlideTitle({
  isCollapsed = false,
  fallbackTitle,
  readOnly = false,
}: SlideTitleProps) {
  const slideId = useSlideId();
  const title = useSlideTitle();
  const { updateSlide } = useSlideActions();
  const { mutate: updateSlideApi } = useUpdateSlide();
  const resolvedFallback = fallbackTitle?.trim() ? fallbackTitle : undefined;
  const resolvedTitle = title?.trim() ? title : (resolvedFallback ?? '');

  const handleSave = (newTitle: string, close: () => void) => {
    const nextTitle = newTitle.trim() || title || resolvedFallback;
    if (!nextTitle) return;

    updateSlide({ title: nextTitle });

    if (slideId) {
      updateSlideApi({ slideId, data: { title: nextTitle } });
    }

    close();
  };

  return (
    <TitleEditorPopover
      title={resolvedTitle}
      onSave={handleSave}
      readOnly={readOnly}
      isCollapsed={isCollapsed}
      ariaLabel="슬라이드 이름 변경"
    />
  );
}
