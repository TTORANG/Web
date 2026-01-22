/**
 * @file SlideWebcamStage.tsx
 * @description (FD_VID_01 - 2a/2b) 슬라이드(메인) + 웹캠 녹화본(PiP) 스테이지
 *
 * - currentTime(초)에 따라 slideChangeTimes 기준으로 슬라이드 자동 전환
 * - 웹캠 녹화본은 webcamVideoUrl(MOCK_VIDEO.videoUrl)을 사용
 * - 탭: 슬라이드/웹캠 위치 토글
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';

import VideoPlaybackBar from '@/components/feedback/VideoPlaybackBar';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Slide } from '@/types/slide';

type Props = {
  slides: Slide[];
  slideChangeTimes: number[];
  webcamVideoUrl: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getActiveSlideIndex(currentTime: number, changeTimes: number[]) {
  let idx = 0;
  for (let i = 0; i < changeTimes.length; i += 1) {
    if (changeTimes[i] <= currentTime) idx = i;
    else break;
  }
  return idx;
}

export default function SlideWebcamStage({ slides, slideChangeTimes, webcamVideoUrl }: Props) {
  const stageRootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);

  const seekTo = useVideoFeedbackStore((s) => s.seekTo);
  const clearSeek = useVideoFeedbackStore((s) => s.clearSeek);

  const [layout, setLayout] = useState<'slide-main' | 'webcam-main'>('slide-main');

  // duration은 재생바 컴포넌트가 필요해서 Stage에서 계산해 props로 내림
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onLoadedMetadata = () => {
      const d = Number.isFinite(el.duration) ? el.duration : 0;
      setDuration(d);
    };

    const onTimeUpdate = () => {
      updateCurrentTime(el.currentTime);
    };

    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [updateCurrentTime]);

  // store.seekTo 구독 -> 실제 video seek
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (seekTo == null) return;

    el.currentTime = seekTo;
    updateCurrentTime(seekTo);
    clearSeek();
  }, [seekTo, clearSeek, updateCurrentTime]);

  // currentTime -> slideIndex 계산
  const activeIndex = useMemo(() => {
    if (!slides.length) return 0;

    const safeTimes = slideChangeTimes.length > 0 ? slideChangeTimes : slides.map((_, i) => i * 10);

    const idx = getActiveSlideIndex(currentTime, safeTimes);
    return clamp(idx, 0, slides.length - 1);
  }, [currentTime, slideChangeTimes, slides]);

  const activeSlide = slides[activeIndex];
  const isSlideMain = layout === 'slide-main';

  return (
    <div ref={stageRootRef} className="flex-1 min-w-0 flex flex-col" data-stage-root>
      {/* 2. 슬라이드 & 웹캠 - 재생바와 함께 오버레이 */}
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
        {/* 2a: 슬라이드 */}
        <div className={clsx('absolute inset-0', isSlideMain ? 'z-10' : 'z-0')}>
          <img
            src={activeSlide.thumb}
            alt={`슬라이드 ${activeIndex + 1} - ${activeSlide.title}`}
            className="h-full w-full object-contain"
            draggable={false}
          />
          <div className="absolute left-4 top-4 rounded-md bg-black/55 px-3 py-1 text-white text-sm">
            {activeIndex + 1}. {activeSlide.title}
          </div>
        </div>

        {/* 2b: 웹캠 녹화본(=진짜 플레이어) */}
        <div
          className={clsx(
            'absolute right-4 bottom-20 rounded-xl overflow-hidden bg-black/40',
            isSlideMain ? 'w-60 h-36 z-20' : 'inset-0 z-10 rounded-none',
          )}
        >
          <video
            ref={videoRef}
            src={webcamVideoUrl}
            className="h-full w-full object-cover"
            playsInline
          />

          <div className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition bg-black/35 flex items-center justify-center text-white text-sm">
            {isSlideMain ? '웹캠 확장' : '슬라이드 확장'}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setLayout((prev) => (prev === 'slide-main' ? 'webcam-main' : 'slide-main'))
          }
          className="absolute left-4 bottom-4 z-30 rounded-lg bg-black/45 text-white px-3 py-2 text-sm hover:bg-black/60 transition"
        >
          웹캠·슬라이드 전환
        </button>

        {/* 재생바/조작을 오버레이로 배치 - 슬라이드 위에 올라감 */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-linear-to-t from-black/60 to-transparent pt-8 pb-4 px-4">
          <VideoPlaybackBar
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            duration={duration}
            fullscreenTargetRef={stageRootRef as React.RefObject<HTMLElement>}
          />
        </div>
      </div>
    </div>
  );
}
