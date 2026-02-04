import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Layout, Logo, Modal } from '@/components/common';
import { DeviceTestSection, RecordingSection } from '@/components/video';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import type { RecordingProject, RecordingSlide } from '@/types/recording';

type RecordStep = 'TEST' | 'RECORDING';

export default function VideoRecordPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<RecordStep>('TEST');
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const [recordingData, setRecordingData] = useState<RecordingProject | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { uploadVideo, isUploading, progress, error } = useVideoUpload();

  const MOCK_SLIDES: RecordingSlide[] = Array.from({ length: 10 }, (_, index) => ({
    id: `slide-${index + 1}`,
    page: index + 1,
    title: '제목없음',
    imageUrl: `/thumbnails/p1/${index}.webp`,
    script: `슬라이드 ${index + 1}번의 임시 대본입니다. 이것은 테스트용 대본이며 실제로는 스토어에서 가져온 데이터가 표시됩니다.`,
  }));

  useEffect(() => {
    if (!projectId) {
      setLoadError('프로젝트 ID가 없습니다.');
      setIsLoadingData(false);
      return;
    }

    try {
      const data: RecordingProject = {
        projectId,
        title: `프로젝트 ${projectId}`,
        slides: MOCK_SLIDES,
      };

      setRecordingData(data);
    } catch (err) {
      setLoadError('데이터를 준비할 수 없습니다.');
    } finally {
      setIsLoadingData(false);
    }
  }, [projectId, MOCK_SLIDES]);

  const handleTestComplete = (streams: { cam: MediaStream }) => {
    streamRef.current = streams.cam;
    setCamStream(streams.cam);
    setStep('RECORDING');
  };

  const handleRecordingFinish = async (videoBlob: Blob, durations: { [key: number]: number }) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCamStream(null);
    }

    if (!videoBlob || videoBlob.size === 0) {
      alert('녹화된 영상이 없습니다.');
      return;
    }

    try {
      const numericProjectId = projectId ? parseInt(projectId.replace(/\D/g, ''), 10) : 1;
      const title = recordingData?.title || `프로젝트 ${projectId}`;

      const slideLogs = Object.entries(durations)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([slideId, _], index, arr) => {
          const previousDuration = arr.slice(0, index).reduce((sum, [, dur]) => sum + dur, 0);
          return {
            slideId: Number(slideId),
            timestampMs: Math.round(previousDuration * 1000),
          };
        });

      const videoId = await uploadVideo(videoBlob, numericProjectId, title, slideLogs);

      if (videoId) {
        try {
          const base64Video = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(videoBlob);
          });

          const videoData = {
            id: videoId,
            projectId: projectId || 'p1',
            title,
            createdAt: new Date().toISOString(),
            durationSeconds: Object.values(durations).reduce((sum, d) => sum + d, 0),
            slideCount: Object.keys(durations).length,
            size: videoBlob.size,
            videoData: base64Video,
            durations,
            status: 'ready',
          };

          const existingVideos = JSON.parse(localStorage.getItem('mockVideos') || '[]');
          existingVideos.unshift(videoData);
          localStorage.setItem('mockVideos', JSON.stringify(existingVideos));
        } catch (err) {
          console.warn('localStorage 저장 실패 (무시):', err);
        }

        navigate(`/${projectId}/video`, {
          state: { uploadSuccess: true, videoId },
          replace: true,
        });
      } else {
        throw new Error(error || '업로드에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '영상 업로드에 실패했습니다.';
      alert(`업로드 실패: ${errorMessage}`);
    }
  };

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCamStream(null);
    setIsExitModalOpen(false);
    navigate(`/${projectId}/slide`);
  };

  const getStepLabel = () => {
    switch (progress.currentStep) {
      case 'preparing':
        return '영상 준비 중...';
      case 'uploading':
        return '영상 업로드 중...';
      case 'finishing':
        return '영상 처리 중...';
      case 'done':
        return '완료!';
      default:
        return '처리 중...';
    }
  };

  const getStepDescription = () => {
    switch (progress.currentStep) {
      case 'preparing':
        return '영상 세션을 생성하고 있습니다';
      case 'uploading':
        return `${progress.uploadedChunks} / ${progress.totalChunks} 청크 업로드 중`;
      case 'finishing':
        return '서버에서 영상을 처리하고 있습니다';
      case 'done':
        return '업로드가 완료되었습니다';
      default:
        return '';
    }
  };

  if (isLoadingData) {
    return (
      <Layout theme="dark" left={<Logo />}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4" />
            <p className="text-white text-lg font-medium">슬라이드 데이터를 준비하는 중...</p>
            <p className="text-white/60 text-sm mt-2">잠시만 기다려주세요</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout theme="dark" left={<Logo />}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">데이터 준비 실패</h2>
            <p className="text-white/80 mb-6">{loadError}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(`/${projectId}/slide`)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition"
              >
                슬라이드 페이지로 이동
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!recordingData) {
    return null;
  }

  return (
    <Layout
      theme="dark"
      left={
        <>
          <Logo />
          <span className="text-body-m-bold text-white">영상 녹화</span>
        </>
      }
      right={
        <button
          onClick={handleExitClick}
          className="flex items-center px-4 py-1.5 text-caption-bold text-white hover:text-gray-400 transition-colors"
        >
          {step === 'RECORDING' ? '녹화 중단' : '종료'}
        </button>
      }
    >
      <div className="relative h-full w-full bg-[#1a1c21]">
        {step === 'TEST' ? (
          <div className="h-full w-full flex items-center justify-center">
            <DeviceTestSection onComplete={handleTestComplete} />
          </div>
        ) : (
          camStream && (
            <>
              <RecordingSection
                title={recordingData.title}
                slides={recordingData.slides}
                initialStream={camStream}
                onFinish={handleRecordingFinish}
              />

              {isUploading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10001]">
                  <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 min-w-[380px] max-w-[480px] shadow-2xl">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
                      <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>

                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{getStepLabel()}</h3>
                      <p className="text-sm text-gray-500">{getStepDescription()}</p>
                    </div>

                    {progress.currentStep === 'uploading' && (
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">진행률</span>
                          <span className="text-sm font-bold text-blue-500">
                            {progress.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 ease-out"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full">
                      <p className="text-xs text-yellow-800 text-center flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        창을 닫지 마시고 잠시만 기다려주세요
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}

        <Modal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          title={step === 'RECORDING' ? '녹화 중단' : '테스트 종료'}
          size="sm"
        >
          <div className="flex flex-col gap-6 p-4">
            <p className="text-sm text-gray-600">
              {step === 'RECORDING'
                ? '녹화를 중단하시겠습니까? 저장되지 않은 데이터는 삭제됩니다.'
                : '테스트를 종료하시겠습니까?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="flex-1 rounded-md bg-gray-100 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 rounded-md bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600"
              >
                종료
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
