import { useState } from 'react';

import { ScriptBox } from '@/components/script-box';
import type { Slide } from '@/types/slide';

import SlideViewer from './SlideViewer';

/** 슬라이드 영역 max-width 계산 (16:9 비율 유지) */
const SLIDE_MAX_WIDTH = 'min(2200px,calc((100dvh-3.75rem-20rem-3rem)*16/9))';

interface SlideWorkspaceProps {
  slide: Slide;
  slideId: string;
}

/**
 * 슬라이드 작업 영역
 * - SlideViewer와 ScriptBox를 통합하여 레이아웃 동기화
 * - 동일한 max-width를 공유하여 정렬 유지
 */
export default function SlideWorkspace({ slide, slideId }: SlideWorkspaceProps) {
  const [isScriptCollapsed, setIsScriptCollapsed] = useState(false);

  return (
    <div className="h-full min-h-0 flex flex-col gap-6">
      <SlideViewer slide={slide} isScriptCollapsed={isScriptCollapsed} />

      <div className="shrink-0">
        <div className="mx-auto w-full px-2" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
          <ScriptBox slideTitle={`슬라이드 ${slideId}`} onCollapsedChange={setIsScriptCollapsed} />
        </div>
      </div>
    </div>
  );
}
