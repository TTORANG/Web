import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Layout, Logo, SlideImage } from '@/components/common';

import { useRecorder } from '../../hooks/useRecorder';

interface SlideLog {
  page: number;
  timestamp: string;
}

interface RecordingSectionProps {
  title: string;
  initialStream: MediaStream;
  onFinish: (blob: Blob, logs: SlideLog[]) => void;
}

export const RecordingSection = ({ title, initialStream, onFinish }: RecordingSectionProps) => {
  const { canvasRef, isRecording, startRecording, stopRecording, recordedChunks } = useRecorder();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [logs, setLogs] = useState<SlideLog[]>([]);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const totalPages = 10;
  const slideImgRef = useRef<HTMLImageElement | null>(null);

  const getSlideImgUrl = (p: number) => `/thumbnails/p1/${p - 1}.webp`;
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    const img = new Image();
    img.src = getSlideImgUrl(currentPage);
    img.onload = () => {
      slideImgRef.current = img;
    };
  }, [currentPage]);

  useEffect(() => {
    if (initialStream && !isRecording) {
      startRecording(initialStream, slideImgRef);
    }
  }, [initialStream, startRecording]);

  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    if (isRecording) id = setInterval(() => setTotalSeconds((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  const handlePageChange = useCallback(
    (dir: 'next' | 'prev') => {
      setCurrentPage((p) => {
        const next = dir === 'next' ? Math.min(p + 1, totalPages) : Math.max(p - 1, 1);
        if (next !== p) {
          setLogs((prev) => [{ page: next, timestamp: formatTime(totalSeconds) }, ...prev]);
        }
        return next;
      });
    },
    [totalSeconds],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') handlePageChange('next');
      if (e.code === 'ArrowLeft') handlePageChange('prev');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePageChange]);

  return (
    <Layout
      theme="dark"
      scrollable={false}
      left={
        <div className="flex items-center gap-4 text-white">
          <Logo />
          <div className="h-5 w-[1px] bg-white/20" />
          <span className="text-base font-bold uppercase tracking-tight">{title}</span>
          <div className="flex items-center gap-2 ml-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500 text-sm font-bold">녹화 중</span>
          </div>
        </div>
      }
      right={
        <div className="flex items-center gap-6 text-white font-bold">
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-mono text-lg tracking-widest">{formatTime(totalSeconds)}</span>
          </div>
          <button
            onClick={() => {
              stopRecording();
              onFinish(new Blob(recordedChunks, { type: 'video/webm' }), logs);
            }}
            className="rounded-md bg-white px-6 py-2 text-sm text-black font-bold hover:bg-gray-100 transition-colors"
          >
            연습 종료
          </button>
        </div>
      }
    >
      <div className="flex h-full w-full bg-[#121418] overflow-hidden">
        <section className="relative flex-1 flex flex-col items-center justify-center p-8 bg-[#121418]">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-[1024px] aspect-[1024/575] rounded-2xl ring-1 ring-white/10 shadow-2xl bg-black overflow-hidden border border-white/5">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-6 left-6 rounded-full bg-black/60 px-4 py-1.5 text-sm font-bold text-white border border-white/10 z-10">
                {currentPage} / {totalPages}
              </div>
            </div>
          </div>
          <p className="mt-6 text-white/30 text-xs font-medium tracking-wide">
            스페이스바 또는 화살표 키를 클릭하여 다음 슬라이드로 이동하세요
          </p>
        </section>

        <aside className="w-[384px] flex flex-col border-l border-white/10 bg-[#1a1c21] p-10 shrink-0 text-left overflow-hidden">
          <div className="mb-8 shrink-0">
            <h3 className="mb-4 text-[0.7rem] font-bold text-white/40 uppercase tracking-widest">
              다음 슬라이드
            </h3>
            <div className="aspect-video rounded-xl bg-[#2a2d34] overflow-hidden ring-1 ring-white/10">
              {currentPage < totalPages && (
                <SlideImage src={getSlideImgUrl(currentPage + 1)} alt="Next" />
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 mb-8">
            <h3 className="mb-4 text-[0.7rem] font-bold text-white/40 uppercase tracking-widest">
              발표 대본
            </h3>
            <div className="flex-1 overflow-y-auto rounded-xl bg-[#2a2d34]/30 p-8 text-white/90 text-[1rem] leading-relaxed scrollbar-hide border border-white/5">
              지난 분기 실적을 보시면, 매출이 전년 대비 30% 증가했습니다.
              {currentPage}페이지 대본 내용이 여기에 표시됩니다.
            </div>
          </div>

          <div className="h-[200px] pt-8 border-t border-white/10 shrink-0">
            <h3 className="mb-4 text-[0.7rem] font-bold text-white/40 uppercase tracking-widest">
              진행 상황
            </h3>
            <div className="h-[calc(100%-2.5rem)] overflow-y-auto space-y-3 scrollbar-hide">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white font-bold">● 슬라이드 {currentPage}</span>
                <span className="text-white/40 font-mono">{formatTime(totalSeconds)}</span>
              </div>
              {logs.slice(1).map((log, i) => (
                <div key={i} className="flex justify-between items-center text-sm text-white/40">
                  <span>○ 슬라이드 {log.page}</span>
                  <span className="font-mono">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};
