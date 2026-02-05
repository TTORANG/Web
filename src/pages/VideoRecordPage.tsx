import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Layout, Logo, Modal } from '@/components/common';
import { DeviceTestSection, RecordingSection } from '@/components/video';
import { usePresentation } from '@/hooks/queries/usePresentations';
import { useVideoUpload } from '@/hooks/useVideoUpload';

type RecordStep = 'TEST' | 'RECORDING';

export default function VideoRecordPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: presentation } = usePresentation(projectId!);

  const [step, setStep] = useState<RecordStep>('TEST');
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const { uploadVideo, isUploading, progress, error } = useVideoUpload();

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
      const title = presentation?.title || '제목 없음';

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
                projectId={projectId!}
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
