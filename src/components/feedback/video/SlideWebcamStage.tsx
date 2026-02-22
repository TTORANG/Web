/**
 * @file SlideWebcamStage.tsx
 * @description (FD_VID_01 - 2a/2b, PD_VID_04) 슬라이드(메인) + 웹캠 녹화본(PiP) 스테이지
 *
 * - currentTime(초)에 따라 slideChangeTimes 기준으로 슬라이드 자동 전환
 * - 웹캠 녹화본은 webcamVideoUrl(MOCK_VIDEO.videoUrl)을 사용
 * - "작은 박스(PiP)"를 hover하면 디밍+텍스트, 클릭하면 슬라이드/웹캠 위치가 토글됨
 * - HLS(.m3u8) 스트리밍 지원 (hls.js)
 */
/* eslint-disable no-console */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import clsx from 'clsx';
import type Hls from 'hls.js';

import RefreshIcon from '@/assets/icons/icon-refresh.svg?react';
import { Spinner } from '@/components/common';
import VideoPlaybackBar from '@/components/feedback/video/VideoPlaybackBar';
import { useVideoSync } from '@/hooks/useVideoSync';
import type { SlideListItem } from '@/types/slide';
import type { SegmentHighlight } from '@/types/video';
import { getSlideTitle } from '@/utils/slideTitle';
import { getSlideIndexFromTime } from '@/utils/video';

const LAYOUT_STORAGE_KEY = 'feedback-video-layout';
type VideoLoadState = 'idle' | 'loading' | 'ready' | 'error';

function getVideoErrorMessage(error: MediaError | null): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return '재생이 중단되었습니다.';
    case MediaError.MEDIA_ERR_NETWORK:
      return '네트워크 문제로 영상을 불러오지 못했습니다.';
    case MediaError.MEDIA_ERR_DECODE:
      return '영상 디코딩에 실패했습니다.';
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return '지원하지 않는 영상 형식입니다.';
    default:
      return '영상을 재생하지 못했습니다.';
  }
}

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
        : 'right-4 bottom-20 w-48 h-27 z-35 rounded'; // 서브면 우측 하단 작은 박스
    }
    // 2. PiP 모드가 아닐 때 (모바일 등)
    // 메인이면 보이고, 서브면 완전히 숨김 (hidden으로 DOM에서 제거)
    return isMain ? 'inset-0 z-10' : 'hidden';
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
          {/* 평소엔 투명, 호버 시 어두운 배경 + 텍스트 표시 (transition 제거로 클릭 시 즉시 사라짐) */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-[#000000]/35" />
          {/** 지금 "작은 박스(PiP)"에 무엇이 들어있는지에 따라 hover 문구 결정 */}
          <div className="relative opacity-0 group-hover:opacity-100 text-[#ffffff] text-sm">
            {label}
          </div>
        </button>
      )}
    </div>
  );
}

// 메인 컴포넌트
type SlideWebcamStageProps = {
  slides: SlideListItem[];
  slideChangeTimes: number[];
  webcamVideoUrl: string;
  isDataLoading?: boolean;
  dataErrorMessage?: string | null;
  onTimeUpdate?: (time: number) => void;
  onVideoEvent?: (eventType: 'play' | 'pause' | 'seek', timeSeconds: number) => void;
  disablePip?: boolean;
  showLayoutToggle?: boolean;
  layoutToggleLabel?: ReactNode;
  segmentHighlights?: SegmentHighlight[];
};

export default function SlideWebcamStage({
  slides,
  slideChangeTimes,
  webcamVideoUrl,
  isDataLoading = false,
  dataErrorMessage = null,
  onTimeUpdate,
  onVideoEvent,
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
  const clickTimeoutRef = useRef<number | null>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const hlsLoadTokenRef = useRef(0);
  const [videoLoadState, setVideoLoadState] = useState<VideoLoadState>(() =>
    webcamVideoUrl ? 'loading' : 'idle',
  );
  const [videoErrorMessage, setVideoErrorMessage] = useState<string | null>(null);

  // 비디오 동기화 훅 (콜백 ref, duration, currentTime, seekTo 처리)
  const { setVideoRef: setVideoRefSync, videoElement, duration, currentTime } = useVideoSync();

  const setMediaError = useCallback((message: string) => {
    setVideoLoadState('error');
    setVideoErrorMessage(message);
  }, []);

  const attachVideoSource = useCallback(
    (el: HTMLVideoElement) => {
      const loadToken = ++hlsLoadTokenRef.current;

      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }

      if (!webcamVideoUrl) {
        setVideoLoadState('idle');
        setVideoErrorMessage(null);
        el.removeAttribute('src');
        el.load();
        return;
      }

      setVideoLoadState('loading');
      setVideoErrorMessage(null);

      const isHls = webcamVideoUrl.includes('.m3u8');
      if (!isHls) {
        el.src = webcamVideoUrl;
        el.load();
        return;
      }

      void import('hls.js')
        .then(({ default: HlsLib }) => {
          if (loadToken !== hlsLoadTokenRef.current) return;

          if (HlsLib.isSupported()) {
            const hls = new HlsLib({
              enableWorker: true,
              lowLatencyMode: false,
            });

            hls.loadSource(webcamVideoUrl);
            hls.attachMedia(el);

            hls.on(HlsLib.Events.MANIFEST_PARSED, () => {
              console.log('[SlideWebcamStage] HLS manifest 로드 완료');
            });

            hls.on(HlsLib.Events.ERROR, (_event, data) => {
              if (!data.fatal) return;
              console.error('[SlideWebcamStage] HLS 치명적 에러:', data);

              switch (data.type) {
                case HlsLib.ErrorTypes.NETWORK_ERROR:
                  setVideoLoadState('loading');
                  setVideoErrorMessage(null);
                  hls.startLoad();
                  break;
                case HlsLib.ErrorTypes.MEDIA_ERROR:
                  setVideoLoadState('loading');
                  setVideoErrorMessage(null);
                  hls.recoverMediaError();
                  break;
                default:
                  setMediaError('웹캠 영상을 재생하지 못했습니다.');
                  hls.destroy();
                  break;
              }
            });

            hlsInstanceRef.current = hls;
            return;
          }

          if (el.canPlayType('application/vnd.apple.mpegurl')) {
            el.src = webcamVideoUrl;
            el.load();
            return;
          }

          console.warn('[SlideWebcamStage] HLS를 지원하지 않는 브라우저입니다.');
          setMediaError('현재 브라우저가 HLS 영상을 지원하지 않습니다.');
        })
        .catch((error) => {
          if (loadToken !== hlsLoadTokenRef.current) return;
          console.error('[SlideWebcamStage] HLS 라이브러리 로드 실패:', error);
          setMediaError('영상 플레이어를 준비하지 못했습니다.');
        });
    },
    [setMediaError, webcamVideoUrl],
  );

  // HLS를 지원하는 비디오 ref 콜백
  const setVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      setVideoRefSync(el);
      if (!el) return;
      attachVideoSource(el);
    },
    [attachVideoSource, setVideoRefSync],
  );

  // 컴포넌트 언마운트 시 HLS 정리
  useEffect(() => {
    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!webcamVideoUrl) {
      setVideoLoadState('idle');
      setVideoErrorMessage(null);
      return;
    }

    setVideoLoadState('loading');
    setVideoErrorMessage(null);
  }, [webcamVideoUrl]);

  useEffect(() => {
    if (!videoElement) return;

    const handleLoadStart = () => {
      setVideoLoadState('loading');
      setVideoErrorMessage(null);
    };
    const handleLoadedMetadata = () => {
      setVideoLoadState('ready');
      setVideoErrorMessage(null);
    };
    const handleCanPlay = () => {
      setVideoLoadState('ready');
      setVideoErrorMessage(null);
    };
    const handleError = () => {
      setMediaError(getVideoErrorMessage(videoElement.error));
    };

    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
    };
  }, [setMediaError, videoElement]);

  // 레이아웃 상태 (localStorage에 저장)
  const [layout, setLayout] = useState<'slide-main' | 'webcam-main'>(() => {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return saved === 'webcam-main' ? 'webcam-main' : 'slide-main';
  });
  const isSlideMain = layout === 'slide-main';
  const showPip = !disablePip;

  // 레이아웃 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
  }, [layout]);

  // onTimeUpdate 콜백 호출
  useEffect(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

  useEffect(() => {
    if (!videoElement || !onVideoEvent) return;

    const emit = (eventType: 'play' | 'pause' | 'seek') => {
      onVideoEvent(eventType, videoElement.currentTime ?? 0);
    };

    const handlePlay = () => emit('play');
    const handlePause = () => emit('pause');
    const handleSeeked = () => emit('seek');

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('seeked', handleSeeked);

    // 재생 중 1초마다 seek 이벤트 전송
    const seekInterval = window.setInterval(() => {
      if (!videoElement.paused && !videoElement.ended) {
        emit('seek');
      }
    }, 1000);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('seeked', handleSeeked);
      window.clearInterval(seekInterval);
    };
  }, [onVideoEvent, videoElement]);

  // currentTime -> slideIndex 계산
  const activeIndex = useMemo(() => {
    if (!slides.length) return 0;

    const safeTimes = slideChangeTimes.length > 0 ? slideChangeTimes : slides.map((_, i) => i * 10);
    return getSlideIndexFromTime(currentTime, safeTimes, slides.length - 1);
  }, [currentTime, slideChangeTimes, slides]);

  const activeSlide = slides[activeIndex];
  const isMediaReady = videoLoadState === 'ready';
  const isMediaLoading = videoLoadState === 'loading';
  const canControlPlayback = Boolean(videoElement) && isMediaReady;

  const retryVideoLoad = useCallback(() => {
    if (!videoElement || !webcamVideoUrl) return;
    attachVideoSource(videoElement);
  }, [attachVideoSource, videoElement, webcamVideoUrl]);

  // 스테이지 한번 클릭 → 재생/일시정지
  const handleStageClick = useCallback(() => {
    // 더블클릭 대기 중인 타이머가 있으면 취소
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // 250ms 후에 싱글클릭 동작 실행 (더블클릭 여부 확인용 딜레이)
    clickTimeoutRef.current = window.setTimeout(() => {
      clickTimeoutRef.current = null;
      if (!videoElement) return;

      if (videoElement.paused) {
        videoElement.play().catch(() => {
          // autoplay 정책 등
        });
      } else {
        videoElement.pause();
      }
    }, 250);
  }, [videoElement]);

  // 스테이지 더블클릭 → 전체화면 토글
  const handleStageDoubleClick = useCallback(async () => {
    // 싱글클릭 타이머 취소
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    const root = stageRootRef.current;
    if (!root) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await root.requestFullscreen();
    }
  }, []);

  // 웹캠 비디오가 없으면 렌더링하지 않음
  if (!webcamVideoUrl) {
    if (isDataLoading) {
      return (
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black" />
        </div>
      );
    }

    const message = dataErrorMessage ?? '재생 가능한 영상이 없습니다.';

    return (
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 bg-gray-900 rounded-xl aspect-video px-4 text-center">
        <span className={clsx('text-body-s', dataErrorMessage ? 'text-red-300' : 'text-gray-300')}>
          {message}
        </span>
      </div>
    );
  }

  // 토글 함수 (PiP 클릭 / 버튼 클릭 공통 사용)
  const toggleLayout = () => {
    setLayout((prev) => (prev === 'slide-main' ? 'webcam-main' : 'slide-main'));
  };

  return (
    <div ref={stageRootRef} className="flex-1 min-w-0 flex flex-col justify-center" data-stage-root>
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl">
        {/* 슬라이드도 "메인/작은 박스" 위치가 토글되도록 class를 바꿈 */}
        {/* 슬라이드 + 웹캠 영역 (PiP 또는 단일) */}
        {/* 1. 슬라이드 영역 - 슬라이드가 있을 때만 렌더링 */}
        {activeSlide && (
          <MediaBox
            isMain={isSlideMain}
            showPip={showPip}
            onToggle={toggleLayout}
            label="슬라이드 확장"
            className="bg-[#000000]/20"
          >
            <img
              src={activeSlide.imageUrl}
              alt={`슬라이드 ${activeIndex + 1} - ${getSlideTitle(activeSlide.title, activeIndex + 1)}`}
              className={clsx(
                'h-full w-full',
                // 슬라이드는 메인일 때 전체 보기(contain), 작은 박스일 땐 꽉 차게(cover)
                isSlideMain ? 'object-contain' : 'object-cover',
              )}
              draggable={false}
            />
          </MediaBox>
        )}
        {/* "슬라이드가 PiP일 때"만 hover 디밍 + 클릭 토글이 가능해야 함 */}
        {/* 2. 웹캠 영역 - 슬라이드가 없으면 항상 메인으로 표시 */}
        <MediaBox
          isMain={!activeSlide || !isSlideMain} // 슬라이드가 없거나 슬라이드가 메인이 아니면 웹캠이 메인
          showPip={showPip && !!activeSlide} // 슬라이드가 있을 때만 PiP 가능
          onToggle={toggleLayout}
          label="웹캠 확장"
          className="bg-[#000000]/40"
        >
          <video
            ref={setVideoRef}
            className="h-full w-full object-cover"
            style={{
              transform: 'scaleX(-1)',
              WebkitTransform: 'scaleX(-1)', // Safari용
            }}
            playsInline
          />
        </MediaBox>

        {isMediaLoading && (
          <div className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 rounded-full border border-[#ffffff]/10 bg-[rgba(26,26,26,0.76)] px-4 py-2 text-caption text-[#ffffff]">
              <Spinner size={16} color="#ffffff" className="text-white" />
              <span>웹캠 영상을 불러오는 중...</span>
            </div>
          </div>
        )}

        {videoLoadState === 'error' && (
          <div className="absolute inset-0 z-45 flex items-center justify-center bg-[#000000]/55 px-4">
            <div className="flex max-w-[320px] flex-col items-center gap-3 rounded-lg border border-red-300/30 bg-[rgba(20,20,20,0.88)] px-4 py-5 text-center">
              <p className="text-body-s text-red-200">
                {videoErrorMessage ?? '웹캠 영상을 불러오지 못했습니다.'}
              </p>
              <button
                type="button"
                onClick={retryVideoLoad}
                className="rounded-full border border-white/25 px-3 py-1.5 text-caption text-[#ffffff] hover:bg-white/10"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 클릭 핸들러 오버레이 */}
        <div
          className={clsx(
            'absolute inset-0 z-30',
            canControlPlayback ? 'cursor-pointer' : 'cursor-wait',
          )}
          onClick={canControlPlayback ? handleStageClick : undefined}
          onDoubleClick={canControlPlayback ? handleStageDoubleClick : undefined}
        />

        {/* 재생바/조작 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 z-40 overflow-visible bg-linear-to-t from-[#000000]/60 to-transparent pt-8 pb-2 px-3">
          <VideoPlaybackBar
            videoElement={videoElement}
            duration={duration}
            isMediaReady={isMediaReady}
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
