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

import { Skeleton } from '@/components/common';
import { SLIDE_MAX_WIDTH } from '@/constants/layout';
import { useSlideActions } from '@/hooks';
import type { Slide } from '@/types/slide';

import SlideViewer from './SlideViewer';
import { ScriptBox } from './script';

interface SlideWorkspaceProps {
  slide?: Slide;
  slideIndex: number;
  isLoading?: boolean;
}

export default function SlideWorkspace({ slide, slideIndex, isLoading }: SlideWorkspaceProps) {
  const [isScriptCollapsed, setIsScriptCollapsed] = useState(false);
  const { initSlide } = useSlideActions();

  useEffect(() => {
    if (slide) {
      initSlide(slide, slideIndex);
    }
  }, [slide, slideIndex, initSlide]);

  if (isLoading) {
    return (
      <div className="h-full min-h-0 flex flex-col">
        {/* 슬라이드 뷰어 스켈레톤 */}
        <section className="flex-1 min-h-0 overflow-hidden">
          <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
            <div className="w-full aspect-video shadow-sm">
              <Skeleton height="100%" />
            </div>
          </div>
        </section>

        {/* 스크립트 박스 스켈레톤 */}
        <div className="shrink-0">
          <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
            <div className="w-full h-[clamp(12rem,30vh,20rem)] rounded-t-lg bg-white shadow-sm p-4">
              <Skeleton width="30%" height={20} className="mb-4" />
              <Skeleton.Text lines={4} lineHeight={16} gap={10} lastLineWidth={0.6} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <SlideViewer isScriptCollapsed={isScriptCollapsed} />

      <div className="shrink-0">
        <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
          <ScriptBox onCollapsedChange={setIsScriptCollapsed} />
        </div>
      </div>
    </div>
  );
}
