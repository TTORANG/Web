/**
 * @file SlideTitle.tsx
 * @description 슬라이드 제목 편집 팝오버
 *
 * ScriptBox 헤더에서 슬라이드 제목을 클릭하면 나타나는 편집 UI입니다.
 * Zustand store를 통해 슬라이드 제목을 읽고 업데이트합니다.
 */
import { TitleEditorPopover } from '@/components/common';
import { useSlideActions, useSlideId, useSlideTitle, useUpdateSlide } from '@/hooks';
import { useSlideStore } from '@/stores/slideStore';
import { getSlideTitle } from '@/utils/slideTitle';

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
  const title = useSlideTitle();
  const slideNum = useSlideStore((state) => state.slide?.slideNum);
  const resolvedFallback = fallbackTitle?.trim()
    ? fallbackTitle
    : slideNum != null
      ? getSlideTitle(undefined, slideNum)
      : '';
  const resolvedTitle =
    slideNum != null ? getSlideTitle(title, slideNum) : title?.trim() ? title : resolvedFallback;

  if (readOnly) {
    return (
      <span className="inline-flex h-7 items-center px-2 text-sm font-semibold text-gray-800 min-w-0">
        <span className="max-w-28 truncate sm:max-w-40">{resolvedTitle}</span>
      </span>
    );
  }

  return (
    <SlideTitleEditable
      title={resolvedTitle}
      inputTitle={title ?? ''}
      inputPlaceholder={resolvedFallback || undefined}
      isCollapsed={isCollapsed}
    />
  );
}

function SlideTitleEditable({
  title,
  inputTitle,
  inputPlaceholder,
  isCollapsed,
}: {
  title: string;
  inputTitle: string;
  inputPlaceholder?: string;
  isCollapsed: boolean;
}) {
  const slideId = useSlideId();
  const storeTitle = useSlideTitle();
  const { updateSlide } = useSlideActions();
  const { mutate: updateSlideApi } = useUpdateSlide();

  const handleSave = (newTitle: string, close: () => void) => {
    const trimmedTitle = newTitle.trim();
    const previousTitle = storeTitle;
    const currentTitle = storeTitle?.trim() ?? '';
    const nextTitle = trimmedTitle || currentTitle;
    if (!nextTitle || nextTitle === currentTitle) {
      close();
      return;
    }

    updateSlide({ title: nextTitle });

    if (slideId) {
      updateSlideApi(
        { slideId, data: { title: nextTitle } },
        {
          onError: () => {
            updateSlide({ title: previousTitle });
          },
        },
      );
    }

    close();
  };

  return (
    <TitleEditorPopover
      title={title}
      inputTitle={inputTitle}
      inputPlaceholder={inputPlaceholder}
      onSave={handleSave}
      isCollapsed={isCollapsed}
      ariaLabel="슬라이드 이름 변경"
      titleClassName="max-w-28 truncate sm:max-w-40"
      showOnMobile
    />
  );
}
