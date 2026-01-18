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

import { SLIDE_MAX_WIDTH } from '@/constants/layout';
import { useSlideActions } from '@/hooks';
import type { Slide } from '@/types/slide';

import SlideViewer from './SlideViewer';
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
      <SlideViewer isLoading={isLoading} isScriptCollapsed={isScriptCollapsed} />

      <div className="shrink-0">
        <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
          <ScriptBox isLoading={isLoading} onCollapsedChange={setIsScriptCollapsed} />
        </div>
      </div>
    </div>
  );
}
