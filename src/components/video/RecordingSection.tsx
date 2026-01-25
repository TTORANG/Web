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

  // 슬라이드 이미지 프리로드
  useEffect(() => {
    const img = new Image();
    img.src = getSlideImgUrl(currentPage);
    img.onload = () => {
      slideImgRef.current = img;
    };
  }, [currentPage]);

  // 녹화 자동 시작
  useEffect(() => {
    if (initialStream && !isRecording) {
      startRecording(initialStream, slideImgRef);
    }
  }, [initialStream, startRecording, isRecording]);

  // 타이머
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
        <div className="flex items-center gap-4">
          <Logo />
          <div className="h-5 w-[1px] bg-white/20" />
          <span className="text-lg font-bold text-white tracking-tight uppercase">{title}</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500 text-xs font-black uppercase">Recording</span>
          </div>
        </div>
      }
      right={
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-mono text-xl font-bold text-blue-400 tabular-nums">
              {formatTime(totalSeconds)}
            </span>
          </div>
          <button
            onClick={() => {
              stopRecording();
              onFinish(new Blob(recordedChunks, { type: 'video/webm' }), logs);
            }}
            className="rounded-xl bg-white px-8 py-2.5 text-sm text-black font-black hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            연습 종료
          </button>
        </div>
      }
    >
      <div className="flex h-full w-full bg-[#0F1115] overflow-hidden">
        {/* 메인 슬라이드 캔버스 영역 */}
        <section className="relative flex-[3] flex flex-col items-center justify-center p-8 min-w-0">
          <div className="relative w-full h-full max-h-[calc(100vh-220px)] flex items-center justify-center">
            <div className="relative w-full aspect-[16/9] max-h-full rounded-3xl ring-2 ring-white/5 shadow-[0_0_60px_rgba(0,0,0,0.6)] bg-black overflow-hidden border border-white/10">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-8 left-8 rounded-xl bg-black/70 backdrop-blur-xl px-5 py-2 text-base font-black text-white border border-white/20 shadow-2xl z-10">
                {currentPage} <span className="text-white/30 mx-1">/</span> {totalPages}
              </div>
            </div>
          </div>
          <p className="mt-8 text-white/30 text-xs font-bold tracking-[0.2em] uppercase">
            Spacebar / Arrows to navigate
          </p>
        </section>

        {/* 사이드바 영역 */}
        <aside className="w-[380px] flex flex-col border-l border-white/5 bg-[#16181D] p-8 shrink-0 overflow-hidden shadow-2xl">
          {/* 다음 슬라이드 미리보기 */}
          <div className="mb-10 shrink-0">
            <h3 className="mb-4 text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">
              Next Slide
            </h3>
            <div className="aspect-video rounded-2xl bg-[#22252C] overflow-hidden border border-white/5 shadow-inner relative group">
              {currentPage < totalPages ? (
                <div className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                  <SlideImage src={getSlideImgUrl(currentPage + 1)} alt="Next" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10 font-black text-xs">
                  END OF SLIDE
                </div>
              )}
            </div>
          </div>

          {/* 대본 영역: 텍스트 가시성 극대화 */}
          <div className="flex-1 flex flex-col min-h-0 mb-10">
            <h3 className="mb-4 text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">
              Script
            </h3>
            <div className="flex-1 overflow-y-auto rounded-2xl bg-black/40 p-7 border border-white/5 shadow-inner scrollbar-hide">
              <p className="text-white text-[1.15rem] font-medium leading-[1.8] drop-shadow-md">
                {/* 실제 데이터 연결 시 scripts[currentPage-1] 형태로 교체 */}
                지난 분기 실적을 보시면, 매출이 전년 대비 30% 증가했습니다. 이러한 성장은 주로 신규
                유입 고객의 증가와...
              </p>
            </div>
          </div>

          {/* 진행 상태 로그 */}
          <div className="h-[160px] pt-8 border-t border-white/10 shrink-0 flex flex-col min-h-0">
            <h3 className="mb-4 text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">
              Progress Log
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
              <div className="flex justify-between items-center bg-blue-500/10 p-3.5 rounded-xl border border-blue-500/20 shadow-sm">
                <span className="text-blue-400 font-black text-sm">● 슬라이드 {currentPage}</span>
                <span className="text-blue-400 font-mono font-bold text-sm tracking-tighter">
                  {formatTime(totalSeconds)}
                </span>
              </div>
              {logs.slice(1).map((log, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-1 text-sm text-white/30"
                >
                  <span className="font-bold">○ 슬라이드 {log.page}</span>
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
