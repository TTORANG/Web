import type { Slide } from '@/types/slide';

interface SlideViewerProps {
  slide: Slide;
  isScriptCollapsed: boolean;
}

/** ScriptBox 접힐 때 슬라이드 이동 거리 (px) */
const COLLAPSED_OFFSET = 120;

export default function SlideViewer({ slide, isScriptCollapsed }: SlideViewerProps) {
  return (
    <section className="flex-1 min-h-0 overflow-hidden pt-2">
      <div className="mx-auto w-full px-2 max-w-[min(2200px,calc((100dvh-3.75rem-20rem-3rem)*16/9))]">
        <div
          className="transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${isScriptCollapsed ? COLLAPSED_OFFSET : 0}px)`,
          }}
        >
          <div className="w-full aspect-video bg-gray-200 shadow-sm relative">
            <span className="text-2xl font-semibold text-gray-800 absolute top-10 left-8">
              {slide.title}
            </span>
            <span className="text-base text-gray-600 absolute bottom-6 left-8">
              {slide.content}
            </span>
          </div>
          <div className="h-6" />
        </div>
      </div>
    </section>
  );
}
