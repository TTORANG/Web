// src/pages/VideoRecordPage.tsx
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Layout, Logo, Modal } from '@/components/common';
import { DeviceTestSection, RecordingSection } from '@/components/video';
import { useVideoUpload } from '@/hooks/useVideoUpload';

type RecordStep = 'TEST' | 'RECORDING';

export default function VideoRecordPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<RecordStep>('TEST');
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const { uploadVideo, isUploading, progress, error } = useVideoUpload();

  // 1. 장치 테스트 완료 시 스트림을 받고 녹화 단계로 전환
  const handleTestComplete = (streams: { cam: MediaStream }) => {
    streamRef.current = streams.cam;
    setCamStream(streams.cam);
    setStep('RECORDING');
  };

  // 2. 녹화 완료 처리
  const handleRecordingFinish = async (videoBlob: Blob, durations: { [key: number]: number }) => {
    console.log('🎯 VideoRecordPage - handleRecordingFinish 호출됨');
    console.log('📦 녹화 완료 데이터:', {
      blobSize: videoBlob.size,
      blobType: videoBlob.type,
      durations,
    });

    // 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`🚫 Track ${track.kind} stopped`);
      });
      streamRef.current = null;
      setCamStream(null);
    }

    // Blob 유효성 검증
    if (!videoBlob || videoBlob.size === 0) {
      console.error('❌ 빈 영상 Blob');
      alert('녹화된 영상이 없습니다.');
      return;
    }

    try {
      // projectId를 숫자로 변환 (API 요구사항)
      const numericProjectId = projectId ? parseInt(projectId.replace(/\D/g, ''), 10) : 1;
      const title = 'Q4 마케팅 전략 발표';

      // slideLogs 생성 (슬라이드 전환 시점을 timestampMs로 계산)
      const slideLogs = Object.entries(durations)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([slideId, _], index, arr) => {
          const previousDuration = arr.slice(0, index).reduce((sum, [, dur]) => sum + dur, 0);
          return {
            slideId: Number(slideId),
            timestampMs: Math.round(previousDuration * 1000),
          };
        });

      console.log('📝 슬라이드 전환 로그:', slideLogs);
      console.log('🚀 API 업로드 시작...');

      // API 업로드 실행
      const videoId = await uploadVideo(videoBlob, numericProjectId, title, slideLogs);

      if (videoId) {
        console.log('✅ 업로드 성공! Video ID:', videoId);

        // 성공 시 영상 페이지로 이동
        navigate(`/${projectId}/video`, {
          state: { uploadSuccess: true, videoId },
          replace: true,
        });
      } else {
        throw new Error(error || '업로드에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 업로드 프로세스 실패:', err);
      const errorMessage = err instanceof Error ? err.message : '영상 업로드에 실패했습니다.';

      // 사용자에게 에러 알림
      if (window.confirm(`${errorMessage}\n\n다시 시도하시겠습니까?`)) {
        console.log('사용자가 재시도를 선택했습니다.');
        // 재시도 로직 (필요시 handleRecordingFinish 재호출)
      } else {
        navigate(`/${projectId}/video`, { replace: true });
      }
    }
  };

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = () => {
    // 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCamStream(null);
    setIsExitModalOpen(false);
    navigate(`/${projectId}/video`);
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
                title="Q4 마케팅 전략 발표"
                initialStream={camStream}
                onFinish={handleRecordingFinish}
              />

              {/* 업로드 로딩 오버레이 */}
              {isUploading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10001]">
                  <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 min-w-[380px] max-w-[480px] shadow-2xl">
                    {/* 로딩 스피너 */}
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
                      <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>

                    {/* 현재 단계 */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{getStepLabel()}</h3>
                      <p className="text-sm text-gray-500">{getStepDescription()}</p>
                    </div>

                    {/* 프로그레스 바 (업로드 중일 때만 표시) */}
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

                    {/* 경고 메시지 */}
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
