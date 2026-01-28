import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Layout, Logo, SlideImage } from '@/components/common';
import { useRecorder } from '../../hooks/useRecorder';

interface SlideData {
  page: number;
  duration: number;
  visited: boolean;
}

interface RecordingSectionProps {
  videoId: string;
  projectId: number;
  title: string;
  initialStream: MediaStream;
  slideUrls: string[];
  onFinish: (durations: { [key: number]: number }) => void;
}

export const RecordingSection = ({ 
  videoId, 
  projectId, 
  title, 
  initialStream, 
  onFinish, 
  slideUrls = [] 
}: RecordingSectionProps) => {
  const slideImgRef = useRef<HTMLImageElement | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const chunkIndexRef = useRef(0);
  const { canvasRef, isRecording, startRecording, stopRecording } = useRecorder();
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [slides, setSlides] = useState<{ [key: number]: SlideData }>({
    1: { page: 1, duration: 0, visited: true }
  });

  const totalPages = slideUrls.length;

  const handleChunkUpload = useCallback(async (blob: Blob) => {
    try {
      const currentIndex = chunkIndexRef.current;
      chunkIndexRef.current++;

      const res = await fetch(`/videos/${videoId}/chunks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          chunkIndex: currentIndex,
          size: blob.size,
          contentType: 'video/webm'
        })
      });
      const data = await res.json();
      if (data.resultType === 'FAILURE') throw new Error(data.error.reason);

      const { uploadUrl, objectKey } = data.success;

      await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'video/webm' }
      });

      await fetch(`/videos/${videoId}/chunks/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          chunkIndex: currentIndex,
          objectKey: objectKey
        })
      });
    } catch (err) {
      console.error("Chunk upload failed:", err);
    }
  }, [videoId, projectId]);

  useEffect(() => {
    if (!slideUrls.length) return;
    const img = new Image();
    img.src = slideUrls[currentPage - 1];
    img.crossOrigin = "anonymous";
    img.onload = () => { slideImgRef.current = img; };
  }, [currentPage, slideUrls]);

  useEffect(() => {
    if (initialStream && !isRecording && totalPages > 0) {
      startRecording(initialStream, slideImgRef, handleChunkUpload);
    }
  }, [initialStream, startRecording, isRecording, totalPages, handleChunkUpload]);

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      id = setInterval(() => {
        setTotalSeconds((v) => v + 1);
        setSlides((prev) => ({
          ...prev,
          [currentPage]: {
            ...prev[currentPage],
            duration: (prev[currentPage]?.duration || 0) + 1,
            visited: true
          }
        }));
      }, 1000);
    }
    return () => clearInterval(id);
  }, [isRecording, currentPage]);

  const handlePageChange = useCallback((dir: 'next' | 'prev') => {
    setCurrentPage((p) => {
      const next = dir === 'next' ? Math.min(p + 1, totalPages) : Math.max(p - 1, 1);
      if (next !== p && totalPages > 0) {
        setSlides(prev => ({
          ...prev,
          [next]: prev[next] || { page: next, duration: 0, visited: true }
        }));
      }
      return next;
    });
  }, [totalPages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') handlePageChange('next');
      if (e.code === 'ArrowLeft') handlePageChange('prev');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePageChange]);

  const handleFinish = async () => {
    stopRecording();
    try {
      await fetch(`/videos/${videoId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      
      const durations = Object.fromEntries(
        Object.entries(slides).map(([k, v]) => [Number(k), v.duration])
      );
      onFinish(durations);
    } catch (err) {
      console.error("Finalizing error:", err);
    }
  };

  const formatTime = (s: number) => 
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (totalPages === 0) return null;

  return (
    <div className="relative w-full h-full font-['Pretendard']">
      <style>{`
        header { background-color: #1a1c21 !important; height: 60px !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; z-index: 1000 !important; }
        header * { color: #ffffff !important; }
        main { margin-top: 60px !important; height: calc(100vh - 60px) !important; background-color: #1A1A1A !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      <Layout
        theme="dark"
        scrollable={false}
        left={
          <div className="flex items-center gap-[24px] h-[60px] relative z-[1001]">
            <Logo />
            <div className="h-8 w-[1px] bg-white/20" />
            <span className="text-[16px] font-bold text-white truncate max-w-[200px]">{title}</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#F24B4B] rounded-full animate-pulse" />
              <span className="text-[16px] font-bold text-white">녹화 중</span>
            </div>
          </div>
        }
        right={
          <div className="flex items-center gap-[24px] h-[60px] relative z-[1001]">
            <div className="flex items-center gap-2 font-mono text-[16px] font-bold text-white tracking-widest uppercase">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {formatTime(totalSeconds)}
            </div>
            <button onClick={handleFinish} className="flex items-center gap-1 bg-[#666B76] px-4 py-1.5 rounded-full text-[12px] font-bold text-white hover:bg-[#5a5f6a] transition-all">
              종료 <span className="w-3 h-3 bg-white rounded-sm ml-1" />
            </button>
          </div>
        }
      >
        <div className="fixed inset-0 top-[60px] flex flex-col lg:flex-row bg-[#1A1A1A] z-[1]">
          <div className="relative flex-1 flex flex-col items-center justify-center p-4">
             <div className="relative w-full max-w-[1024px] aspect-[1024/575] bg-[#000000] shadow-2xl overflow-hidden border border-white/5">
                <canvas ref={canvasRef} width={1440} height={1024} className="absolute inset-0 w-full h-full object-contain" />
                
                <div className="absolute top-[16px] left-[16px] z-[50] bg-black/60 px-[16px] py-[8px] rounded-full flex items-center gap-1 text-[16px] font-bold text-white border border-white/10">
                  {currentPage} <span className="opacity-60">/</span> {totalPages}
                </div>

                <div className="absolute top-[16px] right-[16px] z-[50] bg-black/60 px-[16px] py-[10px] rounded-[8px] flex flex-col items-center min-w-[96px] border border-white/10">
                  <span className="text-[12px] text-[#A9ACB2] font-bold uppercase">현재 슬라이드</span>
                  <span className="text-[20px] font-bold font-mono text-white leading-none mt-1 uppercase">
                    {formatTime(slides[currentPage]?.duration || 0)}
                  </span>
                </div>
             </div>
             <p className="mt-8 text-[#A9ACB2] text-[14px] font-medium text-center">스페이스바 또는 화살표를 클릭하여 다음 슬라이드로 이동하세요</p>
          </div>

          <aside className="w-full lg:w-[384px] h-auto lg:h-full bg-[#343841] border-t lg:border-t-0 lg:border-l border-[#666B76] flex flex-col p-[24px] shrink-0 overflow-hidden">
            <div className="flex flex-col gap-[8px] mb-[24px]">
              <h3 className="text-[#E2E4E8] text-[14px] font-bold uppercase tracking-tight opacity-80">다음 슬라이드</h3>
              <div className="w-full aspect-video bg-[#000000] overflow-hidden border border-white/5">
                 {currentPage < totalPages ? (
                   <div className="w-full h-full">
                     <SlideImage src={slideUrls[currentPage]} alt="next" />
                   </div>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-white/10 font-bold text-2xl uppercase">End</div>
                 )}
              </div>
            </div>

            <div className="flex flex-col min-h-[150px] border-t border-white/10 pt-4 overflow-hidden">
              <h3 className="text-[#E2E4E8] text-[14px] font-bold uppercase tracking-tight opacity-80 mb-3">발표 대본</h3>
              <div className="text-white text-[16px] leading-[1.6] overflow-y-auto pr-2 custom-scrollbar flex-1">
                지난 분기 실적을 보시면, 매출이 전년 대비 30% 증가했습니다. 이러한 성장은 주로 신규 유입 고객의 증가와 서비스 개편에 따른 사용자 리텐션 향상에 기인합니다.
              </div>
            </div>

            <div className="flex-1 flex flex-col border-t border-white/10 mt-6 pt-4 min-h-0">
              <h3 className="text-[#E2E4E8] text-[14px] font-bold uppercase tracking-tight opacity-80 mb-3">진행 상황</h3>
              <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(idx => (
                  <div key={idx} className="flex justify-between items-center text-[15px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${idx === currentPage ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/20'}`} />
                      <span className={idx === currentPage ? 'text-white font-bold' : 'text-white/40'}>슬라이드 {idx}</span>
                    </div>
                    {(slides[idx]?.visited || idx === currentPage) && (
                      <span className={`font-mono text-[14px] ${idx === currentPage ? 'text-white' : 'text-white/40'}`}>
                        {formatTime(slides[idx]?.duration || 0)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Layout>
    </div>
  );
};