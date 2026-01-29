/**
 * @file SlideWebcamStage.tsx
 * @description (FD_VID_01 - 2a/2b) 슬라이드(메인) + 웹캠 녹화본(PiP) 스테이지
 *
 * - currentTime(초)에 따라 slideChangeTimes 기준으로 슬라이드 자동 전환
 * - 웹캠 녹화본은 webcamVideoUrl(MOCK_VIDEO.videoUrl)을 사용
 * - "작은 박스(PiP)"를 hover하면 디밍+텍스트, 클릭하면 슬라이드/웹캠 위치가 토글됨
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import clsx from 'clsx';

import RefreshIcon from '@/assets/icons/icon-refresh.svg?react';
import VideoPlaybackBar from '@/components/feedback/VideoPlaybackBar';
import { useVideoSync } from '@/hooks/useVideoSync';
import type { Slide } from '@/types/slide';
import { getSlideIndexFromTime } from '@/utils/video';

// 공통 미디어 컨테이너 (Slide & Webcam)
interface MediaBoxProps {
  isMain: boolean; // 현재 이 미디어가 메인 화면인가?
  showPip: boolean; // PiP 모드가 활성화되었는가?
  onToggle: () => void; // 위치 토글 핸들러
  label: string; // 호버 시 보여줄 라벨 (예: "슬라이드 확장")
  className?: string; // 배경색 등 추가 스타일
  children: ReactNode; // 내부 컨텐츠 (img 또는 video)
}

function MediaBox({ isMain, showPip, onToggle, label, className, children }: MediaBoxProps) {
  // 컨테이너의 위치 및 크기 결정 로직
  const containerStyle = useMemo(() => {
    // 1. PiP 모드일 때 (데스크톱 등)
    if (showPip) {
      // 메인/작은 박스 위치 토글 로직
      return isMain
        ? 'inset-0 z-10 rounded-none' // 메인이면 전체 화면
        : 'right-4 bottom-25 w-48 h-27 z-20 rounded-xl'; // 서브면 우측 하단 작은 박스
    }
    // 2. PiP 모드가 아닐 때 (모바일 등)
    // 메인이면 보이고, 서브면 뒤에 숨김(opacity-0)
    return isMain ? 'inset-0 z-10' : 'inset-0 z-0 opacity-0 pointer-events-none';
  }, [showPip, isMain]);

  return (
    <div
      className={clsx(
        'absolute overflow-hidden bg-[#000000]/20', // 부드러운 전환 효과 유지
        containerStyle,
        className,
      )}
    >
      {children}

      {/* 서브 화면(PiP)일 때만 호버/클릭 가능한 오버레이 버튼 노출 */}
      {showPip && !isMain && (
        <button
          type="button"
          onClick={onToggle}
          className="group absolute inset-0 font-semi-bold flex items-center justify-center bg-transparent text-body-s"
          aria-label={label}
        >
          {/* 평소엔 투명, 호버 시 어두운 배경 + 텍스트 표시 */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[#000000]/35" />
          {/** 지금 "작은 박스(PiP)"에 무엇이 들어있는지에 따라 hover 문구 결정 */}
          <div className="relative opacity-0 group-hover:opacity-100 transition text-[#ffffff] text-sm">
            {label}
          </div>
        </button>
      )}
    </div>
  );
}

// 메인 컴포넌트
type SlideWebcamStageProps = {
  slides: Slide[];
  slideChangeTimes: number[];
  webcamVideoUrl: string;
  onTimeUpdate?: (time: number) => void;
  disablePip?: boolean;
  showLayoutToggle?: boolean;
  layoutToggleLabel?: ReactNode;
};

export default function SlideWebcamStage({
  slides,
  slideChangeTimes,
  webcamVideoUrl,
  onTimeUpdate,
  disablePip = false,
  showLayoutToggle = false,
  layoutToggleLabel = (
    <div className="text-caption flex items-center justify-center gap-1.5">
      <span>웹캠·슬라이드</span>
      <RefreshIcon className="w-3.5 h-3.5" />
    </div>
  ),
}: SlideWebcamStageProps) {
  const stageRootRef = useRef<HTMLDivElement | null>(null);

  // video sync (videoRef, duration, currentTime, seekTo)
  const { videoRef, duration, currentTime } = useVideoSync();

  const [layout, setLayout] = useState<'slide-main' | 'webcam-main'>('slide-main');
  const isSlideMain = layout === 'slide-main';
  const showPip = !disablePip;

  // onTimeUpdate 콜백 호출
  useEffect(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

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

  return (
    <div ref={stageRootRef} className="flex-1 min-w-0 flex flex-col justify-center" data-stage-root>
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl">
        {/* 슬라이드도 "메인/작은 박스" 위치가 토글되도록 class를 바꿈 */}
        {/* 슬라이드 + 웹캠 영역 (PiP 또는 단일) */}
        {/* 1. 슬라이드 영역 */}
        <MediaBox
          isMain={isSlideMain}
          showPip={showPip}
          onToggle={toggleLayout}
          label="슬라이드 확장"
          className="bg-[#000000]/20"
        >
          <img
            src={activeSlide.thumb}
            alt={`슬라이드 ${activeIndex + 1} - ${activeSlide.title}`}
            className={clsx(
              'h-full w-full',
              // 슬라이드는 메인일 때 전체 보기(contain), 작은 박스일 땐 꽉 차게(cover)
              isSlideMain ? 'object-contain' : 'object-cover',
            )}
            draggable={false}
          />
        </MediaBox>

        {/* 개발단계 확인용: 슬라이드 제목 배지는 슬라이드가 메인일 때만 보여주기 */}
        {/* {isSlideMain && (
            <div className="absolute left-4 top-4 rounded-md bg-[#000000]/55 px-3 py-1 text-[#ffffff] text-sm">
              {activeIndex + 1}. {activeSlide.title}
            </div>
          )} */}

        {/* "슬라이드가 PiP일 때"만 hover 디밍 + 클릭 토글이 가능해야 함 */}
        {/* 2. 웹캠 영역 */}
        <MediaBox
          isMain={!isSlideMain} // 슬라이드가 메인이 아니면 웹캠이 메인
          showPip={showPip}
          onToggle={toggleLayout}
          label="웹캠 확장"
          className="bg-[#000000]/40"
        >
          <video
            ref={videoRef}
            src={webcamVideoUrl}
            className="h-full w-full object-cover" // 웹캠은 항상 꽉 차게
            playsInline
          />
        </MediaBox>

        {/* 재생바/조작 오버레이 - overflow-visible로 썸네일 미리보기 표시 */}
        <div className="absolute bottom-0 left-0 right-0 z-40 overflow-visible bg-linear-to-t from-[#000000]/60 to-transparent pt-8 pb-2 px-3">
          <VideoPlaybackBar
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            duration={duration}
            fullscreenTargetRef={stageRootRef as React.RefObject<HTMLElement>}
            slides={slides}
            slideChangeTimes={slideChangeTimes}
            layoutToggle={
              showLayoutToggle ? { label: layoutToggleLabel, onToggle: toggleLayout } : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
