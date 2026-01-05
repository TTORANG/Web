/**
 * @file SlideViewer.tsx
 * @description 메인 슬라이드 뷰어
 *
 * 현재 선택된 슬라이드를 16:9 비율로 표시합니다.
 * ScriptBox 접힘 상태에 따라 슬라이드 위치가 부드럽게 이동합니다.
 */
import { SLIDE_COLLAPSED_OFFSET, SLIDE_MAX_WIDTH } from '@/constants/layout';

interface SlideViewerProps {
  isScriptCollapsed: boolean;
}

export default function SlideViewer({ isScriptCollapsed }: SlideViewerProps) {
  return (
    <section className="flex-1 min-h-0 overflow-hidden">
      <div className="mx-auto w-full" style={{ maxWidth: SLIDE_MAX_WIDTH }}>
        <div
          className="transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${isScriptCollapsed ? SLIDE_COLLAPSED_OFFSET : 0}px)`,
          }}
        >
          <div className="w-full aspect-video bg-gray-200 shadow-sm" />
        </div>
      </div>
    </section>
  );
}
