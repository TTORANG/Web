/**
 * @file SlideWorkspace.tsx
 * @description 슬라이드 작업 영역 (우측 메인 콘텐츠)
 *
 * SlideViewer와 ScriptBox를 통합하여 레이아웃을 동기화합니다.
 * - 동일한 max-width를 공유하여 정렬 유지
 * - ScriptBox 접힘 상태를 관리하고 SlideViewer에 전달
 * - Zustand store로 슬라이드 상태 관리
 */
import { useEffect, useState } from 'react';

import { Skeleton, SlideImage } from '@/components/common';
import { SLIDE_COLLAPSED_OFFSET, SLIDE_MAX_WIDTH } from '@/constants/layout';
import { useSlideActions, useSlideThumb, useSlideTitle } from '@/hooks';
import type { Slide } from '@/types/slide';

import { ScriptBox } from './script';

interface SlideWorkspaceProps {
  slide?: Slide;
  isLoading?: boolean;
}

export default function SlideWorkspace({ slide, isLoading }: SlideWorkspaceProps) {
  const [isScriptCollapsed, setIsScriptCollapsed] = useState(false);
  const { initSlide } = useSlideActions();

  useEffect(() => {
    if (slide) {
      initSlide(slide);
    }
  }, [slide, initSlide]);

  return (
    <div className="h-full min-h-0 flex flex-col">
      <SlideViewer isScriptCollapsed={isScriptCollapsed} isLoading={isLoading} />

      <div className="shrink-0">
        <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
          {isLoading ? (
            <div className="w-full h-[clamp(12rem,30vh,20rem)] rounded-t-lg bg-white shadow-sm p-4">
              <Skeleton width="30%" height={20} className="mb-4" />
              <Skeleton.Text lines={4} lineHeight={16} gap={10} lastLineWidth={0.6} />
            </div>
          ) : (
            <ScriptBox onCollapsedChange={setIsScriptCollapsed} />
          )}
        </div>
      </div>
    </div>
  );
}

function SlideViewer({
  isScriptCollapsed,
  isLoading,
}: {
  isScriptCollapsed: boolean;
  isLoading?: boolean;
}) {
  const thumb = useSlideThumb();
  const title = useSlideTitle();

  return (
    <section className="flex flex-1 min-h-0 flex-col justify-center overflow-hidden">
      <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
        <div
          className="transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${
              !isLoading && isScriptCollapsed ? SLIDE_COLLAPSED_OFFSET : 0
            }px)`,
          }}
        >
          <div className="relative w-full aspect-video bg-gray-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <Skeleton height="100%" />
            ) : (
              thumb && <SlideImage key={thumb} src={thumb} alt={title} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
