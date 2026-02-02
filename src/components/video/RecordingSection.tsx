import { useCallback, useEffect, useRef, useState } from 'react';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#1A1A1A',
        color: 'white',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '60px',
          backgroundColor: '#22252C',
          borderBottom: '1px solid #666B76',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 72px',
          zIndex: 10000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Logo />
          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            {title || '제목 없음'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="w-2 h-2 rounded-full bg-[#F24B4B] animate-pulse" />
            <span style={{ color: '#F24B4B', fontSize: '14px', fontWeight: 'bold' }}>
              {isFinishing ? '처리 중' : '녹화 중'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-blue-400 font-bold text-xl tabular-nums tracking-wider">
              {formatTime(totalSeconds)}
            </span>
          </div>
          <button
            onClick={handleFinish}
            disabled={!isRecording || isFinishing}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              width: '61px',
              height: '30px',
              backgroundColor: isFinishing ? '#444' : '#666B76',
              borderRadius: '100px',
              border: 'none',
              cursor: isRecording && !isFinishing ? 'pointer' : 'not-allowed',
              opacity: isRecording && !isFinishing ? 1 : 0.5,
            }}
          >
            <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600 }}>
              {isFinishing ? '처리중' : '종료'}
            </span>
            {!isFinishing && (
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1px',
                }}
              />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ marginTop: '60px', height: 'calc(100vh - 60px)', display: 'flex' }}>
        <section className="flex-1 relative flex flex-col items-center justify-center p-[4vh] bg-[#121418]">
          <div className="relative w-full aspect-video max-h-full rounded-2xl ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black overflow-hidden">
            <canvas
              ref={canvasRef}
              width={1920}
              height={1080}
              className="w-full h-full object-contain"
            />
            <div className="absolute left-8 top-8 bg-black/70 backdrop-blur-md px-6 py-2.5 rounded-xl text-white font-bold text-lg border border-white/10">
              {currentPage} / {totalPages}
            </div>
            <div className="absolute right-8 top-8 flex flex-col items-center bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-blue-500/30">
              <span className="text-white/40 font-bold text-[11px] uppercase mb-1">Slide Time</span>
              <span className="text-white font-bold text-2xl font-mono">
                {formatTime(slides[currentPage]?.duration || 0)}
              </span>
            </div>
          </div>
          {currentPage === 1 && (
            <p className="mt-8 text-white/40 text-sm font-medium tracking-widest animate-pulse uppercase">
              Spacebar or Arrows to navigate
            </p>
          )}
        </section>

        {/* Sidebar */}
        <aside
          style={{
            width: '384px',
            backgroundColor: '#343841',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 16px',
            gap: '24px',
            borderLeft: '1px solid #666B76',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ color: '#E2E4E8', fontSize: '14px', fontWeight: 600, margin: 0 }}>
              다음 슬라이드
            </h3>
            <div
              style={{
                width: '352px',
                height: '197px',
                backgroundColor: '#666B76',
                overflow: 'hidden',
              }}
            >
              {currentPage < totalPages ? (
                <SlideImage src={getSlideImgUrl(currentPage + 1)} alt="Next" />
              ) : (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A9ACB2',
                  }}
                >
                  END
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '12px 0', borderTop: '1px solid #666B76' }}>
              <h3 style={{ color: '#E2E4E8', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                발표 대본
              </h3>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                color: '#FFFFFF',
                fontSize: '16px',
                lineHeight: '150%',
              }}
              className="scrollbar-hide"
            >
              {currentPage}페이지 대본 영역입니다. 매출이 전년 대비 30% 증가했습니다.
            </div>
          </div>

          <div style={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 0', borderTop: '1px solid #666B76' }}>
              <h3 style={{ color: '#E2E4E8', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                진행 상황
              </h3>
            </div>
            <div
              ref={logContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
              className="scrollbar-hide"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((idx) => {
                const isCurrent = idx === currentPage;
                const isVisited = slides[idx]?.visited;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: isCurrent || isVisited ? '#FFFFFF' : '#A9ACB2',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: isCurrent ? 600 : 400,
                          color: isCurrent || isVisited ? '#FFFFFF' : '#A9ACB2',
                        }}
                      >
                        슬라이드 {idx}
                      </span>
                    </div>
                    {(isVisited || isCurrent) && (
                      <span
                        style={{
                          color: isCurrent ? '#FFFFFF' : '#E2E4E8',
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: '16px',
                        }}
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
