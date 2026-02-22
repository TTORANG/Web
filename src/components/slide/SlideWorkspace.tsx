/**
 * @file SlideWorkspace.tsx
 * @description 슬라이드 작업 영역 (우측 메인 콘텐츠)
 *
 * SlideViewer와 ScriptBox를 통합하여 레이아웃을 동기화합니다.
 * - 동일한 max-width를 공유하여 정렬 유지
 * - ScriptBox 접힘 상태를 관리하고 SlideViewer에 전달
 * - Zustand store로 슬라이드 상태 관리
 */
import { type TouchEventHandler, useEffect, useMemo, useRef, useState } from 'react';

import { isDemoProject } from '@/constants/demoProject';
import { SLIDE_MAX_WIDTH } from '@/constants/layout';
import { useSlideActions, useSlideId, useSlideScript } from '@/hooks';
import { useProjectScripts, useScript } from '@/hooks/queries/useScript';
import { useSlideCommentsLoader } from '@/hooks/useSlideCommentsLoader';
import type { SlideListItem } from '@/types/slide';

import SlideViewer from './SlideViewer';
import { ScriptBox } from './script';

interface SlideWorkspaceProps {
  slide?: SlideListItem;
  isLoading?: boolean;
  onViewerTouchStart?: TouchEventHandler<HTMLElement>;
  onViewerTouchEnd?: TouchEventHandler<HTMLElement>;
  onViewerTouchCancel?: TouchEventHandler<HTMLElement>;
}

export default function SlideWorkspace({
  slide,
  isLoading,
  onViewerTouchStart,
  onViewerTouchEnd,
  onViewerTouchCancel,
}: SlideWorkspaceProps) {
  const [isScriptCollapsed, setIsScriptCollapsed] = useState(false);
  const { initSlide, updateScript, updateSlide } = useSlideActions();
  const slideId = useSlideId();
  const script = useSlideScript();
  const lastSyncedSlideIdRef = useRef<string>('');
  const lastSyncedScriptRef = useRef<string | null>(null);
  const hasLocalEditLockRef = useRef(false);

  const projectId = slide?.projectId ?? '';
  const isDemoProjectId = isDemoProject(projectId);
  const currentSlideId = slide?.slideId ?? '';
  const { data: projectScripts } = useProjectScripts(projectId, {
    enabled: !!projectId,
    staleTime: 1000 * 60 * 10,
  });

  const projectScript = useMemo(() => {
    if (!currentSlideId) return undefined;
    return projectScripts?.scripts.find((item) => item.slideId === currentSlideId)?.scriptText;
  }, [projectScripts, currentSlideId]);

  const shouldFetchDetailScript = !projectScript && !slide?.script;
  const { data: scriptData } = useScript(currentSlideId, {
    enabled: shouldFetchDetailScript,
    staleTime: 1000 * 60 * 10,
  });

  const resolvedServerScript = projectScript ?? slide?.script ?? scriptData?.scriptText ?? '';

  useEffect(() => {
    if (!slide) return;
    const nextSlide =
      resolvedServerScript !== slide.script ? { ...slide, script: resolvedServerScript } : slide;

    const isSameSlide = slide.slideId === slideId;
    if (isSameSlide) {
      // 같은 슬라이드에서는 로컬 편집 중인 script를 우선 유지합니다.
      // script 동기화는 아래 effect(로컬 편집 감지 포함)에서만 처리합니다.
      updateSlide({
        slideId: nextSlide.slideId,
        projectId: nextSlide.projectId,
        title: nextSlide.title,
        slideNum: nextSlide.slideNum,
        imageUrl: nextSlide.imageUrl,
        createdAt: nextSlide.createdAt,
        updatedAt: nextSlide.updatedAt,
        startTime: nextSlide.startTime,
      });
      return;
    }

    initSlide(nextSlide);
  }, [slide, slideId, initSlide, resolvedServerScript, updateSlide]);

  useEffect(() => {
    if (lastSyncedSlideIdRef.current !== slideId) {
      lastSyncedSlideIdRef.current = slideId;
      lastSyncedScriptRef.current = null;
      hasLocalEditLockRef.current = false;
    }
  }, [slideId]);

  useEffect(() => {
    if (!slideId) return;

    const serverScript = resolvedServerScript;
    const hasSyncedOnce = lastSyncedScriptRef.current !== null;
    const hasLocalEditAfterSync = hasSyncedOnce && script !== lastSyncedScriptRef.current;

    if (hasLocalEditAfterSync) {
      hasLocalEditLockRef.current = true;
    }

    // 로컬 편집이 감지된 슬라이드는 세션 동안 서버 재동기화를 잠급니다.
    if (hasLocalEditLockRef.current && script !== serverScript) return;

    if (script !== serverScript) {
      updateScript(serverScript);
    }

    lastSyncedScriptRef.current = serverScript;
  }, [resolvedServerScript, script, slideId, updateScript]);

  useSlideCommentsLoader(slide?.slideId, { enabled: !isDemoProjectId });

  return (
    <div className="relative h-full min-h-0 flex flex-col pb-[clamp(12rem,30vh,20rem)] md:pb-0">
      <SlideViewer
        isLoading={isLoading}
        isScriptCollapsed={isScriptCollapsed}
        onTouchStart={onViewerTouchStart}
        onTouchEnd={onViewerTouchEnd}
        onTouchCancel={onViewerTouchCancel}
      />

      <div className="fixed inset-x-0 bottom-0 z-30 shrink-0 px-4 pb-[env(safe-area-inset-bottom)] md:static md:px-0 md:pb-0">
        <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
          <ScriptBox
            isLoading={isLoading}
            readOnly={isDemoProjectId}
            onCollapsedChange={setIsScriptCollapsed}
          />
        </div>
      </div>
    </div>
  );
}
