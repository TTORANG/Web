/**
 * @file VideoRecordPage.tsx
 * @description 영상 녹화 페이지 (테스트 -> 녹화 전환 및 스트림 전달)
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Layout, Logo, Modal } from '@/components/common';
import { DeviceTestSection, RecordingSection } from '@/components/video';

type RecordStep = 'TEST' | 'RECORDING';

export default function VideoRecordPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<RecordStep>('TEST');
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // 1. 장치 테스트 완료 시 스트림을 받고 녹화 단계로 전환
  const handleTestComplete = (streams: { cam: MediaStream }) => {
    setCamStream(streams.cam);
    setStep('RECORDING');
  };

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    navigate(`/${projectId}/video`);
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
          /* 2. 장치 테스트 섹션 (onComplete 전달) */
          <div className="h-full w-full flex items-center justify-center">
            <DeviceTestSection onComplete={handleTestComplete} />
          </div>
        ) : (
          /* 3. 녹화 진행 섹션 (실제 캔버스 합성 및 녹화 수행) */
          camStream && (
            <RecordingSection
              title="Q4 마케팅 전략 발표"
              initialStream={camStream}
              onFinish={(blob, logs) => {
                console.log('녹화 완료 데이터:', blob, logs);
                // 추후 Joy(W3P0Server) 파트 API 연동 지점
              }}
            />
          )
        )}

        <Modal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          title="테스트 종료"
          size="sm"
        >
          <div className="flex flex-col gap-6 p-4">
            <p className="text-sm text-gray-600">
              녹화를 중단하시겠습니까? 저장되지 않은 데이터는 삭제됩니다.
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
