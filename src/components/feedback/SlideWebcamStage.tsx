/**
 * @file SlideWebcamStage.tsx
 * @description (FD_VID_01 - 2a/2b) 슬라이드(메인) + 웹캠 녹화본(PiP) 스테이지
 *
 * - currentTime(초)에 따라 slideChangeTimes 기준으로 슬라이드 자동 전환
 * - 웹캠 녹화본은 webcamVideoUrl(MOCK_VIDEO.videoUrl)을 사용
 * - "작은 박스(PiP)"를 hover하면 디밍+텍스트, 클릭하면 슬라이드/웹캠 위치가 토글됨
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';

import VideoPlaybackBar from '@/components/feedback/VideoPlaybackBar';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Slide } from '@/types/slide';
import { getSlideIndexFromTime } from '@/utils/video';

type SlideWebcamStageProps = {
  slides: Slide[];
  slideChangeTimes: number[];
  webcamVideoUrl: string;
};

export default function SlideWebcamStage({
  slides,
  slideChangeTimes,
  webcamVideoUrl,
}: SlideWebcamStageProps) {
  const stageRootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);

  const seekTo = useVideoFeedbackStore((s) => s.seekTo);
  const clearSeek = useVideoFeedbackStore((s) => s.clearSeek);

  const [layout, setLayout] = useState<'slide-main' | 'webcam-main'>('slide-main');
  const isSlideMain = layout === 'slide-main';

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
    return getSlideIndexFromTime(currentTime, safeTimes, slides.length - 1);
  }, [currentTime, slideChangeTimes, slides]);

  const activeSlide = slides[activeIndex];

  // 토글 함수 (PiP 클릭 / 버튼 클릭 공통 사용)
  const toggleLayout = () => {
    setLayout((prev) => (prev === 'slide-main' ? 'webcam-main' : 'slide-main'));
  };

  // 지금 "작은 박스(PiP)"에 무엇이 들어있는지에 따라 hover 문구 결정
  // - slide-main이면 PiP는 웹캠 => "웹캠 확장"
  // - webcam-main이면 PiP는 슬라이드 => "슬라이드 확장"
  const pipLabel = isSlideMain ? '웹캠 확장' : '슬라이드 확장';

  return (
    <div ref={stageRootRef} className="flex-1 min-w-0 flex flex-col" data-stage-root>
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl">
        {/* 슬라이드도 "메인/작은 박스" 위치가 토글되도록 class를 바꿈 */}
        <div
          className={clsx(
            'absolute overflow-hidden bg-[#000000]/20',
            isSlideMain
              ? 'inset-0 z-10 rounded-none' // 슬라이드가 메인일 때: 크게
              : 'right-4 bottom-20 w-60 h-36 z-20 rounded-xl', // 웹캠이 메인일 때: 슬라이드가 작은 박스
          )}
        >
          <img
            src={activeSlide.thumb}
            alt={`슬라이드 ${activeIndex + 1} - ${activeSlide.title}`}
            className={clsx(
              'h-full w-full',
              isSlideMain ? 'object-contain' : 'object-cover', // 작은 박스일 땐 꽉 차게(보기 좋게)
            )}
            draggable={false}
          />

          {/* 개발단계 확인용: 슬라이드 제목 배지는 슬라이드가 메인일 때만 보여주기 */}
          {isSlideMain && (
            <div className="absolute left-4 top-4 rounded-md bg-[#000000]/55 px-3 py-1 text-[#ffffff] text-sm">
              {activeIndex + 1}. {activeSlide.title}
            </div>
          )}

          {/* "슬라이드가 PiP일 때"만 hover 디밍 + 클릭 토글이 가능해야 함 */}
          {!isSlideMain && (
            <button
              type="button"
              onClick={toggleLayout}
              className="group absolute inset-0 font-semi-bold flex items-center justify-center bg-transparent"
              aria-label="슬라이드 확장"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[#000000]/35" />
              <div className="relative opacity-0 group-hover:opacity-100 transition text-[#ffffff] text-sm">
                {pipLabel}
              </div>
            </button>
          )}
        </div>

        {/* 웹캠도 "메인/작은 박스" 위치가 토글되도록 class를 바꿈 */}
        <div
          className={clsx(
            'absolute overflow-hidden bg-[#000000]/40',
            isSlideMain
              ? 'right-4 bottom-20 w-60 h-36 z-20 rounded-xl' // 슬라이드 메인일 때: 웹캠이 작은 박스
              : 'inset-0 z-10 rounded-none', // 웹캠 메인일 때: 웹캠이 크게
          )}
        >
          <video
            ref={videoRef}
            src={webcamVideoUrl}
            className="h-full w-full object-cover"
            playsInline
          />

          {/* "웹캠이 PiP일 때"만 hover 디밍 + 클릭 토글 */}
          {isSlideMain && (
            <button
              type="button"
              onClick={toggleLayout}
              className="group absolute inset-0 flex items-center justify-center bg-transparent"
              aria-label="웹캠 확장"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[#000000]/35" />
              <div className="relative opacity-0 group-hover:opacity-100 transition text-[#ffffff] text-sm">
                {pipLabel}
              </div>
            </button>
          )}
        </div>

        {/* 재생바/조작 오버레이 - overflow-visible로 썸네일 미리보기 표시 */}
        <div className="absolute bottom-0 left-0 right-0 z-40 overflow-visible bg-linear-to-t from-[#000000]/60 to-transparent pt-8 pb-4 px-4">
          <VideoPlaybackBar
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            duration={duration}
            fullscreenTargetRef={stageRootRef as React.RefObject<HTMLElement>}
            slides={slides}
            slideChangeTimes={slideChangeTimes}
          />
        </div>
      </div>
    </div>
  );
}
