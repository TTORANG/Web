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
import { useSlideActions, useSlideId } from '@/hooks';
import { useSlideCommentsQuery } from '@/hooks/queries/useCommentQueries';
import { useScript } from '@/hooks/queries/useScript';
import type { SlideListItem } from '@/types/slide';

import SlideViewer from './SlideViewer';
import { ScriptBox } from './script';

interface SlideWorkspaceProps {
  slide?: SlideListItem;
  isLoading?: boolean;
}

export default function SlideWorkspace({ slide, isLoading }: SlideWorkspaceProps) {
  const [isScriptCollapsed, setIsScriptCollapsed] = useState(false);
  const { initSlide, setComments, updateScript } = useSlideActions();
  const slideId = useSlideId();
  const { data: fetchedComments } = useSlideCommentsQuery(slideId);
  const { data: scriptData } = useScript(slideId);

  useEffect(() => {
    if (slide) {
      initSlide(slide);
      setComments([]);
      updateScript('');
    }
  }, [slide, initSlide, setComments, updateScript]);

  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments, setComments]);

  useEffect(() => {
    if (scriptData) {
      updateScript(scriptData.scriptText);
    }
  }, [scriptData, updateScript]);

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
