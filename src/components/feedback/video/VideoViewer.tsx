/**
 * @file VideoViewer.tsx
 * @description 영상 피드백 뷰어
 *
 * 영상을 재생하고 현재 시간을 추적합니다.
 */
import { useVideoSync } from '@/hooks/useVideoSync';

interface VideoViewerProps {
  videoUrl: string;
  videoTitle?: string;
}

export default function VideoViewer({ videoUrl, videoTitle }: VideoViewerProps) {
  // 비디오 동기화 훅 (네이티브 controls 사용)
  const { setVideoRef, handleTimeUpdate } = useVideoSync({ useNativeControls: true });

  return (
    <section className="flex-1 min-w-0">
      {videoTitle ? (
        <header className="mb-3">
          <h1 className="text-body-m-bold">{videoTitle}</h1>
        </header>
      ) : null}

      <div className="w-full">
        <video
          ref={setVideoRef}
          src={videoUrl}
          controls
          className="w-full rounded-2xl bg-[#000000]"
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
    </section>
  );
}
