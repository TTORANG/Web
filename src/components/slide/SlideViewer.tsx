/**
 * @file SlideViewer.tsx
 * @description 슬라이드 이미지 뷰어
 *
 * 슬라이드 이미지를 표시하며, 로딩 상태일 때 스켈레톤을 보여줍니다.
 */
import type { TouchEventHandler } from 'react';

import { SlideImage } from '@/components/common';
import { SLIDE_MAX_HEIGHT, SLIDE_MAX_WIDTH } from '@/constants/layout';
import { useSlideThumb, useSlideTitle } from '@/hooks';

interface SlideViewerProps {
  isLoading?: boolean;
  onTouchStart?: TouchEventHandler<HTMLElement>;
  onTouchEnd?: TouchEventHandler<HTMLElement>;
  onTouchCancel?: TouchEventHandler<HTMLElement>;
}

export default function SlideViewer({
  isLoading,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: SlideViewerProps) {
  const thumb = useSlideThumb();
  const title = useSlideTitle();
  const imageAlt = title ?? '슬라이드';

  return (
    <section
      className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden min-[1024px]:justify-end min-[1024px]:pb-3"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
        {isLoading ? (
          <div className="relative w-full shadow-sm overflow-hidden rounded-lg">
            <div className="w-full aspect-video bg-gray-200 animate-pulse" />
          </div>
        ) : (
          thumb && (
            <div className="relative mx-auto w-full overflow-hidden rounded-lg shadow-sm">
              <SlideImage
                src={thumb}
                alt={imageAlt}
                maxHeight={SLIDE_MAX_HEIGHT}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          )
        )}
      </div>
    </section>
  );
}
