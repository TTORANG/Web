/**
 * @file VideoViewer.tsx
 * @description 영상 피드백 뷰어
 *
 * 영상을 재생하고 현재 시간을 추적합니다.
 */
import { useCallback, useEffect, useRef } from 'react';

import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';

interface VideoViewerProps {
  videoUrl: string;
  videoTitle?: string;
}

export default function VideoViewer({ videoUrl, videoTitle }: VideoViewerProps) {
  // video DOM에 접근하기 위한 ref (기존 그대로)
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const updateTimestamp = useVideoFeedbackStore((s) => s.updateTimestamp);

  // 댓글 클릭 등으로 "seek 요청"이 들어오면 여기서 처리
  const seekTo = useVideoFeedbackStore((s) => s.seekTo);
  const clearSeek = useVideoFeedbackStore((s) => s.clearSeek);

  //  timeupdate 이벤트 때 현재 재생 시간을 store로 전달 (기존 그대로)
  const handleTimeUpdate = useCallback(() => {
    const t = videoRef.current?.currentTime ?? 0;
    updateTimestamp(t);
  }, [updateTimestamp]);

  //  seekTo 값이 오면 video.currentTime 변경 + 처리 후 clear
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (seekTo == null) return;

    el.currentTime = seekTo;
    clearSeek(); // seek 요청 1회 처리 후 비움(중복 방지)
  }, [seekTo, clearSeek]);

  return (
    <section className="flex-1 min-w-0">
      {videoTitle ? (
        <header className="mb-3">
          <h1 className="text-body-m-bold">{videoTitle}</h1>
        </header>
      ) : null}

      <div className="w-full">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full rounded-2xl bg-black"
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
    </section>
  );
}
