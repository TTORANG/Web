import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useRecorder } from '../../hooks/useRecorder';
import { DarkHeader } from '../common/DarkHeader';

interface SlideLog {
  page: number;
  timestamp: string;
}

interface RecordingSectionProps {
  title: string;
  initialStreams: {
    slide: MediaStream;
    cam: MediaStream;
  };
  onFinish: (blob: Blob, logs: SlideLog[]) => void;
}

export const RecordingSection = ({ title, initialStreams, onFinish }: RecordingSectionProps) => {
  const { canvasRef, isRecording, startRecording, stopRecording, recordedChunks } = useRecorder();

  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<SlideLog[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const totalPages = 10;

  // 해결 1: useRef 초기값에 Date.now()를 직접 넣지 않고 null로 시작하거나
  // 컴포넌트 생명주기 내에서 관리하도록 변경합니다.
  const startTimeRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 해결 2: NodeJS.Timeout 대신 window.setInterval을 사용하여 타입을 맞춥니다.
  useEffect(() => {
    let timerId: number | undefined;
    if (isRecording) {
      timerId = window.setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) window.clearInterval(timerId);
    };
  }, [isRecording]);

  const handlePageChange = useCallback(
    (direction: 'next' | 'prev') => {
      setCurrentPage((prev) => {
        const nextP = direction === 'next' ? Math.min(prev + 1, totalPages) : Math.max(prev - 1, 1);

        if (nextP !== prev) {
          setLogs((prevLogs) => [
            ...prevLogs,
            {
              page: nextP,
              timestamp: formatTime(totalSeconds),
            },
          ]);
        }
        return nextP;
      });
    },
    [totalSeconds, totalPages],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        handlePageChange('next');
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePageChange('prev');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePageChange]);

  useEffect(() => {
    if (initialStreams && !isRecording) {
      startTimeRef.current = Date.now();
      startRecording(initialStreams.slide, initialStreams.cam);
    }
  }, [initialStreams, isRecording, startRecording]);

  const handleFinish = () => {
    stopRecording();
    const finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
    onFinish(finalBlob, logs);
  };

  return (
    <div className="flex h-screen flex-col bg-[#1a1c21] text-white">
      <DarkHeader
        title={title}
        renderRight={
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-sm font-mono font-bold">{formatTime(totalSeconds)}</span>
            </div>
            <button
              onClick={handleFinish}
              className="rounded-md bg-white px-5 py-2 text-xs font-bold text-black hover:bg-gray-200 transition-colors"
            >
              녹화 종료
            </button>
          </div>
        }
      />

      <main className="flex flex-1 overflow-hidden">
        <section className="relative flex flex-[3] flex-col items-center justify-center p-10 bg-[#121418]">
          <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-2xl bg-[#2a2d34] shadow-2xl ring-1 ring-white/10">
            <canvas
              ref={canvasRef}
              width={1920}
              height={1080}
              className="h-full w-full object-contain"
            />
            <div className="absolute top-8 left-8 rounded-full bg-black/60 px-5 py-1.5 text-xs font-bold border border-white/10">
              {currentPage} / {totalPages} 페이지
            </div>
          </div>
          <p className="mt-8 text-sm text-gray-500 font-medium">
            스페이스바 또는 화살표 키로 슬라이드를 넘기세요
          </p>
        </section>

        <aside className="flex flex-1 flex-col border-l border-white/5 bg-[#1a1c21] p-10">
          <div className="mb-12">
            <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
              다음 슬라이드
            </h3>
            <div className="aspect-video w-full rounded-xl bg-[#2a2d34] ring-1 ring-white/10" />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
              발표 대본
            </h3>
            <div className="flex-1 overflow-y-auto rounded-2xl bg-[#2a2d34]/30 p-6 ring-1 ring-white/5">
              <p className="text-[15px] leading-relaxed text-gray-300">이곳에 대본이 표시됩니다.</p>
            </div>
          </div>
          <div className="mt-12 pt-10 border-t border-white/5">
            <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
              진행 상황
            </h3>
            <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
              <ul className="space-y-5">
                <li className="flex justify-between items-center text-sm opacity-50">
                  <span className="flex items-center gap-3">슬라이드 1 시작</span>
                  <span className="font-mono text-xs">00:00</span>
                </li>
                {logs.map((log, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-3 font-semibold text-blue-400">
                      슬라이드 {log.page} 전환
                    </span>
                    <span className="font-mono text-xs">{log.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
