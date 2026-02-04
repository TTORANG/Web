import { useCallback, useEffect, useRef, useState } from 'react';

import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg?react';
import IconArrowRight from '@/assets/icons/icon-arrow-right.svg?react';
import IconStop from '@/assets/icons/icon-stop.svg?react';
import { Logo, SlideImage } from '@/components/common';

import { useRecorder } from '../../hooks/useRecorder';

interface SlideData {
  page: number;
  duration: number;
  visited: boolean;
}

interface RecordingSectionProps {
  title: string;
  initialStream: MediaStream;
  onFinish: (videoBlob: Blob, durations: { [key: number]: number }) => void;
}

export const RecordingSection = ({ title, initialStream, onFinish }: RecordingSectionProps) => {
  const slideImgRef = useRef<HTMLImageElement | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const { canvasRef, isRecording, recordedChunks, startRecording, stopRecording } = useRecorder();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [slides, setSlides] = useState<{ [key: number]: SlideData }>({
    1: { page: 1, duration: 0, visited: true },
  });
  const [slideImageLoaded, setSlideImageLoaded] = useState<boolean>(false);
  const [recordingStartAttempted, setRecordingStartAttempted] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  const totalPages = 10;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const getSlideImgUrl = (p: number) => `/thumbnails/p1/${p - 1}.webp`;

  useEffect(() => {
    setSlideImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getSlideImgUrl(currentPage);

    img.onload = () => {
      slideImgRef.current = img;
      setSlideImageLoaded(true);
    };

    if (currentPage < totalPages) {
      const prefetch = new Image();
      prefetch.src = getSlideImgUrl(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (initialStream && !isRecording && slideImageLoaded && !recordingStartAttempted) {
      setRecordingStartAttempted(true);
      startRecording(initialStream, slideImgRef, () => {});
    }
  }, [initialStream, isRecording, slideImageLoaded, recordingStartAttempted, startRecording]);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      setTotalSeconds((v) => v + 1);
      setSlides((prev) => ({
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
          setSlides((prev) => ({
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
        Object.entries(slides).map(([k, v]) => [Number(k), v.duration]),
      );

      const finalVideoBlob = new Blob(recordedChunks, { type: 'video/webm' });

      if (finalVideoBlob.size === 0) {
        throw new Error('녹화된 영상이 없습니다.');
      }
      onFinish(finalVideoBlob, durations);
    } catch (error) {
      alert(error instanceof Error ? error.message : '녹화 종료 중 오류가 발생했습니다.');
      setIsFinishing(false); // 에러 발생 시에만 다시 활성화
    }
  }, [isFinishing, isRecording, stopRecording, recordedChunks, slides, onFinish]);
  return (
    <div className="fixed inset-0 z-[9999] bg-white">
      {/* Header */}
      <header className="fixed left-0 top-0 z-[10000] flex h-15 w-full items-center justify-between border-b border-gray-400 bg-gray-200 px-18">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="text-body-m-bold text-black">{title || '제목 없음'}</span>
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
          <button
            onClick={handleFinish}
            disabled={!isRecording || isFinishing}
            className="flex items-center gap-1 rounded-full bg-gray-400 py-1.5 pl-3 pr-2 transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-caption-bold text-black">{isFinishing ? '처리중' : '종료'}</span>
            {!isFinishing && <IconStop className="h-4 w-4 text-black" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-15 flex h-[calc(100vh-60px)]">
        {/* Slide Area */}
        <section className="relative flex flex-1 flex-col bg-white">
          {/* Canvas Area */}
          <div className="relative flex flex-1 items-center justify-center px-5 py-4">
            <div className="relative h-full w-full max-w-[1024px]">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="h-full w-full rounded-lg object-contain"
              />

              {/* Slide Counter - Top Left */}
              <div className="absolute left-5 top-4 flex items-center gap-2 rounded-full bg-white/65 px-4 py-2">
                <span className="text-body-m-bold text-black">{currentPage}</span>
                <span className="text-body-m-bold text-black">/</span>
                <span className="text-body-m-bold text-black">{totalPages}</span>
              </div>

              {/* Current Slide Timer - Top Right */}
              <div className="absolute right-5 top-4 flex flex-col items-start rounded-lg bg-white/65 px-4 pb-2 pt-2.5">
                <span className="text-caption-bold text-gray-600">현재 슬라이드</span>
                <span className="text-body-l-bold text-black">
                  {formatTime(slides[currentPage]?.duration || 0)}
                </span>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/65 p-2 transition-colors hover:bg-white/80 disabled:opacity-30"
              >
                <IconArrowLeft className="h-6 w-6 text-black" />
              </button>
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/65 p-2 transition-colors hover:bg-white/80 disabled:opacity-30"
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
        <aside className="flex w-96 shrink-0 flex-col gap-6 bg-gray-200 px-4 py-6">
          {/* Next Slide Preview */}
          <div className="flex flex-col gap-2">
            <h3 className="text-body-s-bold text-gray-800">다음 슬라이드</h3>
            <div className="h-[197px] w-full overflow-hidden bg-gray-400">
              {currentPage < totalPages ? (
                <SlideImage src={getSlideImgUrl(currentPage + 1)} alt="다음 슬라이드" />
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
            <div className="scrollbar-hide flex-1 overflow-y-auto text-body-m leading-normal text-black">
              지난 분기 실적을 보시면, 매출이 전년 대비 30% 증가했습니다.
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
                const isVisited = slides[idx]?.visited;
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
                        {formatTime(slides[idx]?.duration || 0)}
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
