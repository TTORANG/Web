/**
 * @file SlideWorkspace.tsx
 * @description 슬라이드 작업 영역 (우측 메인 콘텐츠)
 *
 * SlideViewer와 ScriptBox를 통합하여 레이아웃을 동기화합니다.
 * - 동일한 max-width를 공유하여 정렬 유지
 * - ScriptBox 접힘 상태를 관리하고 SlideViewer에 전달
 * - Zustand store로 슬라이드 상태 관리
 */
import { useEffect, useRef, useState } from 'react';

import { SLIDE_MAX_WIDTH } from '@/constants/layout';
import { useSlideActions, useSlideId, useSlideScript } from '@/hooks';
import { useScript } from '@/hooks/queries/useScript';
import { useSlideCommentsLoader } from '@/hooks/useSlideCommentsLoader';
import type { SlideListItem } from '@/types/slide';

import SlideViewer from './SlideViewer';
import { ScriptBox } from './script';

interface SlideWorkspaceProps {
  slide?: SlideListItem;
  isLoading?: boolean;
}

export default function SlideWorkspace({ slide, isLoading }: SlideWorkspaceProps) {
  const [isScriptCollapsed, setIsScriptCollapsed] = useState(false);
  const { initSlide, updateScript, updateSlide } = useSlideActions();
  const slideId = useSlideId();
  const script = useSlideScript();
  const { data: scriptData } = useScript(slideId);
  const lastSyncedSlideIdRef = useRef<string>('');
  const lastSyncedScriptRef = useRef<string | null>(null);

  useEffect(() => {
    if (!slide) return;

    const isSameSlide = slide.slideId === slideId;
    if (isSameSlide) {
      updateSlide(slide);
      return;
    }

    initSlide(slide);
    updateScript('');
  }, [slide, slideId, initSlide, updateScript, updateSlide]);

  useSlideCommentsLoader(slide?.slideId);

  useEffect(() => {
    if (lastSyncedSlideIdRef.current !== slideId) {
      lastSyncedSlideIdRef.current = slideId;
      lastSyncedScriptRef.current = null;
    }
  }, [slideId]);

  useEffect(() => {
    if (!scriptData) return;

    const serverScript = scriptData.scriptText;
    const hasSyncedOnce = lastSyncedScriptRef.current !== null;
    const hasLocalEditAfterSync = hasSyncedOnce && script !== lastSyncedScriptRef.current;

    // 로컬 편집이 있는 동안에는 서버 응답으로 덮어쓰지 않습니다.
    if (hasLocalEditAfterSync && script !== serverScript) return;

    if (script !== serverScript) {
      updateScript(serverScript);
    }

    lastSyncedScriptRef.current = serverScript;
  }, [script, scriptData, updateScript]);

  return (
    <div className="relative h-full min-h-0 flex flex-col pb-[clamp(12rem,30vh,20rem)] md:pb-0">
      <SlideViewer isLoading={isLoading} isScriptCollapsed={isScriptCollapsed} />

      <div className="fixed inset-x-0 bottom-0 z-30 shrink-0 px-4 pb-[env(safe-area-inset-bottom)] md:static md:px-0 md:pb-0">
        <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
          <ScriptBox isLoading={isLoading} onCollapsedChange={setIsScriptCollapsed} />
        </div>
      </div>
    </div>
  );
}
