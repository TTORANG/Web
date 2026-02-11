import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg?react';
import IconArrowRight from '@/assets/icons/icon-arrow-right.svg?react';
import { Logo, SlideImage } from '@/components/common';
import { usePresentation } from '@/hooks/queries/usePresentations';
import { useScript } from '@/hooks/queries/useScript';
import { useSlides } from '@/hooks/queries/useSlides';

import { useRecorder } from '../../hooks/useRecorder';
import StopButton from './StopButton';

interface SlideData {
  page: number;
  duration: number;
  visited: boolean;
}

interface RecordingSectionProps {
  projectId: string;
  initialStream: MediaStream;
  onFinish: (videoBlob: Blob, durations: { [key: number]: number }) => void;
  onExitClick?: () => void;
}

export const RecordingSection = ({
  projectId,
  initialStream,
  onFinish,
  onExitClick,
}: RecordingSectionProps) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const slideImgRef = useRef<HTMLImageElement | null>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);

  const { isRecording, recordedChunks, startRecording, stopRecording } = useRecorder();

  const { data: presentation } = usePresentation(projectId);
  const { data: slidesData } = useSlides(projectId);
  const slidesList = useMemo(
    () => slidesData?.map((slide) => ({ id: slide.slideId, url: slide.imageUrl })) ?? [],
    [slidesData],
  );
  const totalPages = slidesList.length > 0 ? slidesList.length : 1;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [slideProgress, setSlideProgress] = useState<{ [key: number]: SlideData }>({
    1: { page: 1, duration: 0, visited: true },
  });
  const [recordingStartAttempted, setRecordingStartAttempted] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const currentSlideId = slidesList[currentPage - 1]?.id;
  const { data: scriptData } = useScript(currentSlideId ?? '');

  // 캠 프리뷰 설정
  useEffect(() => {
    if (initialStream && camVideoRef.current) {
      camVideoRef.current.srcObject = initialStream;
    }
  }, [initialStream]);

  // 녹화 시작
  useEffect(() => {
    if (initialStream && !isRecording && !recordingStartAttempted) {
      setRecordingStartAttempted(true);
      startRecording(initialStream, slideImgRef);
    }
  }, [initialStream, isRecording, recordingStartAttempted, startRecording]);

  // 타이머
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      setTotalSeconds((v) => v + 1);
      setSlideProgress((prev) => ({
        ...prev,
        [currentPage]: {
          ...prev[currentPage],
          duration: (prev[currentPage]?.duration || 0) + 1,
          visited: true,
        },
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [isRecording, currentPage]);

  const handlePageChange = useCallback(
    (dir: 'next' | 'prev') => {
      setCurrentPage((p) => {
        const next = dir === 'next' ? Math.min(p + 1, totalPages) : Math.max(p - 1, 1);
        if (next !== p) {
          setSlideProgress((prev) => ({
            ...prev,
            [next]: prev[next] || { page: next, duration: 0, visited: true },
          }));
        }
        return next;
      });
    },
    [totalPages],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        handlePageChange('next');
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePageChange('prev');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePageChange]);

  const handleFinish = useCallback(async () => {
    if (isFinishing || !isRecording) {
      return;
    }

    setIsFinishing(true);

    try {
      stopRecording();
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const durations = Object.fromEntries(
        Object.entries(slideProgress).map(([k, v]) => [Number(k), v.duration]),
      );

      const finalVideoBlob = new Blob(recordedChunks, { type: 'video/webm' });

      if (finalVideoBlob.size === 0) {
        throw new Error('녹화된 영상이 없습니다.');
      }

      onFinish(finalVideoBlob, durations);
    } catch (error) {
      alert(error instanceof Error ? error.message : '녹화 종료 중 오류가 발생했습니다.');
      setIsFinishing(false);
    }
  }, [isFinishing, isRecording, stopRecording, recordedChunks, slideProgress, onFinish]);

  return (
    <div className="fixed inset-0 z-60 bg-white">
      {/* 숨겨진 슬라이드 이미지 (녹화용) */}
      <img
        ref={slideImgRef}
        src={slidesList[currentPage - 1]?.url}
        alt="current slide for recording"
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
        crossOrigin="anonymous"
      />

      {/* Header */}
      <header className="fixed left-0 top-0 z-70 flex h-15 w-full items-center justify-between border-b border-gray-200 bg-white px-18">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <Logo onClick={onExitClick} />
            <span className="hidden md:inline-flex h-7 items-center px-2 text-sm font-semibold text-gray-800 min-w-0">
              <span className="max-w-60 truncate">{presentation?.title || '내 발표'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-error" />
            <span className="text-body-m-bold text-black">
              {isFinishing ? '처리 중' : '녹화 중'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-black">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 4V8L10.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-body-m-bold tabular-nums text-black">
              {formatTime(totalSeconds)}
            </span>
          </div>
          <StopButton
            label={isFinishing ? '처리중' : '종료'}
            disabled={!isRecording || isFinishing}
            onClick={handleFinish}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-15 flex h-[calc(100vh-60px)]">
        {/* Slide & Camera Area */}
        <section className="relative flex flex-1 flex-col bg-white">
          <div className="relative flex flex-1 items-center justify-center px-5 py-4">
            <div className="relative h-full w-full max-w-[1024px]">
              {/* 슬라이드 배경 - 사용자에게 보이는 프리뷰 */}
              <div className="h-full w-full rounded-lg bg-gray-900 flex items-center justify-center overflow-hidden">
                {slidesList[currentPage - 1]?.url ? (
                  <img
                    src={slidesList[currentPage - 1].url}
                    alt={`슬라이드 ${currentPage}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-white">슬라이드 로딩 중...</div>
                )}
              </div>

              {/* 캠 프리뷰 - PIP 스타일 (우측 하단) */}
              <div className="absolute right-5 bottom-28 w-48 h-27 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black z-10">
                <video
                  ref={camVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Slide Counter - Top Left */}
              <div className="absolute left-5 top-4 flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 z-10">
                <span className="text-body-m-bold text-black">{currentPage}</span>
                <span className="text-body-m-bold text-black">/</span>
                <span className="text-body-m-bold text-black">{totalPages}</span>
              </div>

              {/* Current Slide Timer - Top Right */}
              <div className="absolute right-5 top-4 flex flex-col items-start rounded-lg bg-white/65 px-4 pb-2 pt-2.5 z-10">
                <span className="text-caption-bold text-gray-600">현재 슬라이드</span>
                <span className="text-body-l-bold text-black">
                  {formatTime(slideProgress[currentPage]?.duration || 0)}
                </span>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/65 p-2 transition-colors hover:bg-white/80 disabled:opacity-30 z-10"
              >
                <IconArrowLeft className="h-6 w-6 text-black" />
              </button>
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/65 p-2 transition-colors hover:bg-white/80 disabled:opacity-30 z-10"
              >
                <IconArrowRight className="h-6 w-6 text-black" />
              </button>
            </div>
          </div>

          {/* Bottom Hint Text */}
          <p className="pb-6 text-center text-body-s text-gray-600">
            스페이스바 또는 화살표를 클릭하여 다음 슬라이드로 이동하세요
          </p>
        </section>

        {/* Sidebar */}
        <aside className="flex w-96 shrink-0 flex-col gap-6 bg-gray-100 px-4 py-6">
          {/* Next Slide Preview */}
          <div className="flex flex-col gap-2">
            <h3 className="text-body-s-bold text-gray-800">다음 슬라이드</h3>
            <div className="h-[197px] w-full overflow-hidden rounded-lg bg-gray-400">
              {currentPage < totalPages ? (
                <SlideImage src={slidesList[currentPage]?.url} alt="다음 슬라이드" />
              ) : (
                <div className="flex h-full items-center justify-center text-body-m text-gray-600">
                  마지막 슬라이드
                </div>
              )}
            </div>
          </div>

          {/* Script Section */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-t border-gray-400 py-3">
              <h3 className="text-body-s-bold text-gray-800">발표 대본</h3>
            </div>
            <div className="scrollbar-hide flex-1 overflow-y-auto text-body-m leading-normal text-black whitespace-pre-wrap">
              {scriptData?.scriptText || '대본이 없습니다.'}
            </div>
          </div>

          {/* Progress Section */}
          <div className="flex flex-col">
            <div className="border-t border-gray-400 py-3">
              <h3 className="text-body-s-bold text-gray-800">진행 상황</h3>
            </div>
            <div
              ref={logContainerRef}
              className="scrollbar-hide flex max-h-32 flex-col gap-2 overflow-y-auto"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((idx) => {
                const isCurrent = idx === currentPage;
                const isVisited = slideProgress[idx]?.visited;
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isCurrent ? 'bg-main-variant1' : isVisited ? 'bg-black' : 'bg-gray-600'
                        }`}
                      />
                      <span
                        className={`text-body-m ${
                          isCurrent
                            ? 'font-semibold text-black'
                            : isVisited
                              ? 'text-black'
                              : 'text-gray-600'
                        }`}
                      >
                        슬라이드 {idx}
                      </span>
                    </div>
                    {(isVisited || isCurrent) && (
                      <span
                        className={`tabular-nums text-body-m ${isCurrent ? 'text-black' : 'text-gray-800'}`}
                      >
                        {formatTime(slideProgress[idx]?.duration || 0)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
