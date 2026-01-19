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
  videoTitle: string;
}

// export default function VideoViewer({ videoUrl, videoTitle }: VideoViewerProps) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const updateTimestamp = useVideoFeedbackStore((state) => state.updateTimestamp);

//   // 영상 시간 변화 감지
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const handleTimeUpdate = () => {
//       updateTimestamp(video.currentTime);
//     };

//     video.addEventListener('timeupdate', handleTimeUpdate);
//     return () => video.removeEventListener('timeupdate', handleTimeUpdate);
//   }, [updateTimestamp]);

//   return (
//     <div className="flex flex-col flex-1 bg-gray-900">
//       <div className="flex-1 flex items-center justify-center overflow-hidden">
//         <video
//           ref={videoRef}
//           src={videoUrl}
//           controls
//           className="w-full h-full object-contain"
//           crossOrigin="anonymous"
//         />
//       </div>

//       <div className="shrink-0 bg-black text-white px-6 py-4 text-center">
//         <h2 className="text-body-m font-semibold">{videoTitle}</h2>
//       </div>
//     </div>
//   );
// }

export default function VideoViewer({ videoUrl, videoTitle }: VideoViewerProps) {
  // ✅ [추가] video DOM에 접근하기 위한 ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ [추가] store 액션 가져오기
  const updateTimestamp = useVideoFeedbackStore((s) => s.updateTimestamp);

  // ✅ [추가] timeupdate 이벤트 때 현재 재생 시간을 store로 전달
  const handleTimeUpdate = useCallback(() => {
    const t = videoRef.current?.currentTime ?? 0;
    updateTimestamp(t);
  }, [updateTimestamp]);

  return (
    // ✅ 기존 레이아웃/스타일은 그대로 두고
    // video 태그에 ref + onTimeUpdate만 붙이면 됨
    <section className="flex-1 min-w-0">
      {videoTitle ? (
        <header className="mb-3">
          <h1 className="text-body-m-bold">{videoTitle}</h1>
        </header>
      ) : null}

      <div className="w-full">
        <video
          // ✅ [추가]
          ref={videoRef}
          // ✅ 기존 그대로
          src={videoUrl}
          controls
          className="w-full rounded-2xl bg-black"
          // ✅ [추가]
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
    </section>
  );
}
