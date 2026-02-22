import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg?react';
import IconArrowRight from '@/assets/icons/icon-arrow-right.svg?react';
import IconVideo from '@/assets/icons/icon-video.svg?react';
import { Logo, SlideImage } from '@/components/common';
import { usePresentation } from '@/hooks/queries/usePresentations';
import { useProjectScripts } from '@/hooks/queries/useScript';
import { useSlides } from '@/hooks/queries/useSlides';
import { useRecorder } from '@/hooks/useRecorder';
import { getSlideTitle } from '@/utils/slideTitle';

import StopButton from './StopButton';

interface SlideData {
  page: number;
  duration: number;
  visited: boolean;
}

interface RecordingSectionProps {
  projectId: string;
  initialStream: MediaStream;
  onFinish: (videoBlob: Blob, slideLogs: { slideId: number; timestampMs: number }[]) => void;
  onExitClick?: () => void;
}

const SCRIPT_FONT_SIZE_CLASSES = ['text-body-s', 'text-body-m', 'text-body-l'] as const;

export const RecordingSection = ({
  projectId,
  initialStream,
  onFinish,
  onExitClick,
}: RecordingSectionProps) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const slideImgRef = useRef<HTMLImageElement | null>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);

  // 1. 실시간 타임라인 기록을 위한 Ref (State 비동기 누락 방지)
  const slideLogsRef = useRef<{ slideId: number; timestampMs: number }[]>([]);
  const startTimeRef = useRef<number>(0);

  const { isRecording, startRecording, stopRecording, getRecordedBlob } = useRecorder();

  const { data: presentation } = usePresentation(projectId);
  const { data: slidesData, isLoading: isSlidesLoading } = useSlides(projectId, {
    liveSync: false,
  });
  const { data: projectScripts, isLoading: isProjectScriptsLoading } = useProjectScripts(
    projectId,
    {
      enabled: !!projectId,
      staleTime: 1000 * 60 * 10,
    },
  );
  const slidesList = useMemo(() => {
    const projectScriptMap = new Map(
      (projectScripts?.scripts ?? []).map((scriptItem) => [
        String(scriptItem.slideId),
        scriptItem.scriptText ?? '',
      ]),
    );

    return (
      slidesData?.map((slide, index) => ({
        id: slide.slideId,
        url: slide.imageUrl,
        script: projectScriptMap.get(String(slide.slideId)) ?? slide.script ?? '',
        title: getSlideTitle(slide.title, slide.slideNum ?? index + 1),
      })) ?? []
    );
  }, [projectScripts, slidesData]);
  const totalPages = slidesList.length > 0 ? slidesList.length : 1;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [slideProgress, setSlideProgress] = useState<{ [key: number]: SlideData }>({
    1: { page: 1, duration: 0, visited: true },
  });
  const [scriptFontSizeIndex, setScriptFontSizeIndex] = useState<number>(1);
  const [isMobileWebcamVisible, setIsMobileWebcamVisible] = useState<boolean>(true);
  const [recordingStartAttempted, setRecordingStartAttempted] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const currentSlideScript = slidesList[currentPage - 1]?.script ?? '';
  const isScriptLoading = isSlidesLoading || isProjectScriptsLoading;
  const scriptDisplayText =
    currentSlideScript || (isScriptLoading ? '대본 불러오는 중...' : '대본이 없습니다.');
  const isScriptFontSizeMin = scriptFontSizeIndex === 0;
  const isScriptFontSizeMax = scriptFontSizeIndex === SCRIPT_FONT_SIZE_CLASSES.length - 1;
  const scriptFontSizeClass = SCRIPT_FONT_SIZE_CLASSES[scriptFontSizeIndex];

  // 녹화 시작 및 첫 로그 생성 함수
  const startRecordingWithLog = useCallback(
    (stream: MediaStream) => {
      startTimeRef.current = Date.now();
      startRecording(stream);
      const firstSlideId = slidesList[0]?.id;
      if (firstSlideId) {
        slideLogsRef.current = [{ slideId: parseInt(firstSlideId, 10), timestampMs: 0 }];
      }
    },
    [startRecording, slidesList],
  );

  // 캠 프리뷰 연결
  useEffect(() => {
    if (initialStream && camVideoRef.current) {
      camVideoRef.current.srcObject = initialStream;
    }
  }, [initialStream]);

  // 자동 녹화 시작 시점 제어
  useEffect(() => {
    if (initialStream && !isRecording && !recordingStartAttempted && slidesList.length > 0) {
      setRecordingStartAttempted(true);
      startRecordingWithLog(initialStream);
    }
  }, [initialStream, isRecording, recordingStartAttempted, startRecordingWithLog, slidesList]);

  // 타이머 (전체 및 개별 슬라이드 시간 UI 표시용)
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

  // 진행 상황 리스트 자동 스크롤
  useEffect(() => {
    if (logContainerRef.current) {
      const container = logContainerRef.current;
      const currentItem = container.querySelector(`[data-page="${currentPage}"]`) as HTMLElement;
      if (currentItem) {
        const containerTop = container.getBoundingClientRect().top;
        const itemTop = currentItem.getBoundingClientRect().top;
        const scrollTarget =
          container.scrollTop +
          (itemTop - containerTop) -
          container.clientHeight / 2 +
          currentItem.clientHeight / 2;

        container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
    }
  }, [currentPage]);

  // 페이지 전환 및 타임라인 로그 기록
  const handlePageChange = useCallback(
    (dir: 'next' | 'prev') => {
      setCurrentPage((p) => {
        const next = dir === 'next' ? Math.min(p + 1, totalPages) : Math.max(p - 1, 1);
        if (next !== p) {
          // UI 상태 업데이트
          setSlideProgress((prev) => ({
            ...prev,
            [next]: prev[next] || { page: next, duration: 0, visited: true },
          }));

          const nextSlideId = slidesList[next - 1]?.id;
          if (nextSlideId && startTimeRef.current) {
            const elapsedMs = Date.now() - startTimeRef.current;
            const lastLog = slideLogsRef.current[slideLogsRef.current.length - 1];
            if (!lastLog || lastLog.slideId !== parseInt(nextSlideId, 10)) {
              slideLogsRef.current.push({
                slideId: parseInt(nextSlideId, 10),
                timestampMs: elapsedMs,
              });
            }
          }
        }
        return next;
      });
    },
    [totalPages, slidesList],
  );

  // 키보드 이벤트 핸들러
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

  // 최종 종료 및 데이터 전달
  const handleFinish = useCallback(async () => {
    if (isFinishing || !isRecording) return;
    setIsFinishing(true);

    try {
      await stopRecording();
      const finalVideoBlob = getRecordedBlob();

      if (!finalVideoBlob || finalVideoBlob.size === 0) {
        throw new Error('녹화된 영상이 없습니다.');
      }

      onFinish(finalVideoBlob, slideLogsRef.current);
    } catch (error) {
      alert(error instanceof Error ? error.message : '오류가 발생했습니다.');
      setIsFinishing(false);
    }
  }, [isFinishing, isRecording, stopRecording, getRecordedBlob, onFinish]);

  return (
    <div className="fixed inset-0 z-60 bg-white">
      <img
        ref={slideImgRef}
        src={slidesList[currentPage - 1]?.url}
        alt="recording slide"
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
        crossOrigin="anonymous"
      />

      <header className="fixed left-0 top-0 z-70 flex h-15 w-full items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 md:px-18">
        <div className="flex min-w-0 items-center gap-3 md:gap-6">
          <Logo onClick={onExitClick} />
          <span className="hidden h-7 min-w-0 items-center px-2 text-sm font-semibold text-gray-800 md:inline-flex">
            <span className="max-w-60 truncate">{presentation?.title || '내 발표'}</span>
          </span>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="h-2 w-2 animate-pulse rounded-full bg-error" />
            <span className="text-body-m-bold whitespace-nowrap text-black">
              {isFinishing ? '처리 중' : '녹화 중'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-6">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
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

      <main className="mt-15 flex h-[calc(100vh-3.75rem)] flex-col overflow-hidden md:flex-row">
        <section className="relative flex shrink-0 flex-col bg-white px-3 pb-4 pt-3 md:min-h-0 md:flex-1 md:px-5 md:pb-7 md:pt-5">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 md:rounded-lg">
            {slidesList[currentPage - 1]?.url ? (
              <img
                src={slidesList[currentPage - 1].url}
                alt={`슬라이드 ${currentPage}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-body-m text-gray-800">
                슬라이드 로딩 중...
              </div>
            )}

            <div className="absolute inset-0 z-[1] md:hidden">
              <button
                type="button"
                aria-label="이전 슬라이드(왼쪽 영역)"
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className="absolute inset-y-0 left-0 w-1/2 bg-transparent active:bg-black/5 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                aria-label="다음 슬라이드(오른쪽 영역)"
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages}
                className="absolute inset-y-0 right-0 w-1/2 bg-transparent active:bg-black/5 disabled:cursor-not-allowed"
              />
            </div>

            <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 md:left-5 md:top-4 md:px-4 md:py-2">
              <span className="text-body-m-bold text-black">{currentPage}</span>
              <span className="text-body-m-bold text-black">/</span>
              <span className="text-body-m-bold text-black">{totalPages}</span>
            </div>

            <div className="absolute right-3 top-3 z-10 hidden flex-col items-start rounded-lg bg-white/75 px-3 pb-2 pt-2 md:right-5 md:top-4 md:flex md:px-4 md:pt-2.5">
              <span className="text-caption-bold text-gray-800">현재 슬라이드</span>
              <span className="text-body-l-bold text-black">
                {formatTime(slideProgress[currentPage]?.duration || 0)}
              </span>
            </div>

            <div
              className={`absolute bottom-3 right-3 z-10 h-20 w-32 overflow-hidden rounded-lg border border-white/60 shadow-lg md:bottom-4 md:right-4 md:h-27 md:w-48 md:rounded-xl ${
                isMobileWebcamVisible ? '' : 'hidden md:block'
              }`}
            >
              <video
                ref={camVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
                style={{
                  transform: 'scaleX(-1)',
                  WebkitTransform: 'scaleX(-1)',
                }}
              />
              <button
                type="button"
                aria-label="웹캠 미리보기 끄기"
                onClick={() => setIsMobileWebcamVisible(false)}
                className="absolute inset-0 z-20 bg-transparent md:hidden"
              />
            </div>

            <button
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/75 p-2 transition-colors hover:bg-white/90 disabled:opacity-30 md:left-5"
            >
              <IconArrowLeft className="h-6 w-6 text-black" />
            </button>
            <button
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/75 p-2 transition-colors hover:bg-white/90 disabled:opacity-30 md:right-5"
            >
              <IconArrowRight className="h-6 w-6 text-black" />
            </button>
          </div>

          {currentPage === 1 && (
            <p className="mt-3 text-center text-body-s text-gray-800 md:mt-4">
              스페이스바 또는 화살표를 클릭하여 다음 슬라이드로 이동하세요
            </p>
          )}
        </section>

        <aside className="flex min-h-0 w-full flex-1 shrink-0 flex-col gap-4 bg-gray-100 px-4 py-4 md:h-full md:w-96 md:flex-none md:gap-6 md:border-l md:border-gray-200 md:overflow-hidden md:py-6">
          <div className="hidden flex-col gap-2 md:flex">
            <h3 className="text-body-s-bold text-gray-800">다음 슬라이드</h3>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-400 md:h-[197px] md:aspect-auto">
              {currentPage < totalPages ? (
                <SlideImage src={slidesList[currentPage]?.url} alt="다음 슬라이드" />
              ) : (
                <div className="flex h-full items-center justify-center text-body-m text-gray-800">
                  마지막 슬라이드
                </div>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between py-2 md:border-t md:border-gray-400 md:py-3">
              <h3 className="text-body-s-bold text-gray-800">발표 대본</h3>
              <div className="flex items-center gap-2">
                <div className="hidden h-8 w-16 items-center justify-evenly rounded-full border border-gray-400 bg-white md:flex">
                  <button
                    type="button"
                    aria-label="대본 글자 크기 줄이기"
                    onClick={() => setScriptFontSizeIndex((prev) => Math.max(0, prev - 1))}
                    disabled={isScriptFontSizeMin}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-base font-semibold text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    aria-label="대본 글자 크기 키우기"
                    onClick={() =>
                      setScriptFontSizeIndex((prev) =>
                        Math.min(SCRIPT_FONT_SIZE_CLASSES.length - 1, prev + 1),
                      )
                    }
                    disabled={isScriptFontSizeMax}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-base font-semibold text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={isMobileWebcamVisible ? '웹캠 미리보기 끄기' : '웹캠 미리보기 켜기'}
                  aria-pressed={isMobileWebcamVisible}
                  onClick={() => setIsMobileWebcamVisible((prev) => !prev)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 bg-white text-gray-800 transition-colors active:bg-gray-200 md:hidden"
                >
                  <span className="relative inline-flex items-center justify-center">
                    <IconVideo className="h-4 w-4" />
                    {!isMobileWebcamVisible && (
                      <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 -rotate-45 bg-current" />
                    )}
                  </span>
                </button>
              </div>
            </div>
            <div
              className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto leading-normal whitespace-pre-wrap text-black ${scriptFontSizeClass}`}
            >
              {scriptDisplayText}
            </div>
          </div>

          <div className="flex shrink-0 flex-col">
            <div className="py-2 md:border-t md:border-gray-400 md:py-3">
              <h3 className="text-body-s-bold text-gray-800">진행 상황</h3>
            </div>
            <div
              ref={logContainerRef}
              className="scrollbar-hide flex h-[10rem] flex-col gap-2 overflow-y-auto scroll-smooth md:h-auto md:max-h-32"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((idx) => {
                const isCurrent = idx === currentPage;
                const isVisited = slideProgress[idx]?.visited;
                return (
                  <div
                    key={idx}
                    data-page={idx}
                    className={`flex h-12 items-center justify-between rounded-sm px-1 transition-colors duration-200 ${
                      isCurrent ? 'bg-gray-200/50' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isCurrent ? 'bg-main-variant1' : isVisited ? 'bg-black' : 'bg-gray-600'
                        }`}
                      />
                      <span
                        className={`min-w-0 truncate text-body-m ${
                          isCurrent
                            ? 'font-semibold text-black'
                            : isVisited
                              ? 'text-black'
                              : 'text-gray-600'
                        }`}
                      >
                        {slidesList[idx - 1]?.title}
                      </span>
                    </div>
                    {(isVisited || isCurrent) && (
                      <span
                        className={`tabular-nums text-body-m ${
                          isCurrent ? 'text-black' : 'text-gray-800'
                        }`}
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
