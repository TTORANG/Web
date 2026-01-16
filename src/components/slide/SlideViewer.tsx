/**
 * @file SlideViewer.tsx
 * @description 슬라이드 이미지 뷰어
 *
 * 슬라이드 이미지를 표시하며, 로딩 상태일 때 스켈레톤을 보여줍니다.
 * ScriptBox의 접힘 상태에 따라 위치가 조정됩니다.
 */
import { Skeleton, SlideImage } from '@/components/common';
import { SLIDE_MAX_WIDTH } from '@/constants/layout';
import { useSlideThumb, useSlideTitle } from '@/hooks';

interface SlideViewerProps {
  isLoading?: boolean;
  isScriptCollapsed?: boolean;
}

export default function SlideViewer({ isLoading }: SlideViewerProps) {
  const thumb = useSlideThumb();
  const title = useSlideTitle();

  return (
    <section className="flex flex-1 min-h-0 flex-col justify-center overflow-hidden">
      <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
        <div className="relative w-full aspect-video bg-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <Skeleton height="100%" />
          ) : (
            thumb && <SlideImage key={thumb} src={thumb} alt={title} />
          )}
        </div>
      </div>
    </section>
  );
}
