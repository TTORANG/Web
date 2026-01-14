import { useState } from 'react';

import { Modal } from '@/components/common';
import { DeviceTestSection, RecordingEmptySection } from '@/components/video';
import { VideoHeader } from '@/components/video/VideoHeader';

type VideoStep = 'EMPTY' | 'TEST' | 'RECORDING';

const VideoPage = () => {
  const [step, setStep] = useState<VideoStep>('EMPTY');
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    setStep('EMPTY');
  };

  return (
    <div className="relative h-full w-full bg-gray-100">
      {step === 'EMPTY' && (
        <div className="flex h-full items-center justify-center p-4">
          <RecordingEmptySection onStart={() => setStep('TEST')} />
        </div>
      )}

      {(step === 'TEST' || step === 'RECORDING') && (
        <div className="fixed inset-0 z-[60] flex h-screen w-screen flex-col overflow-hidden bg-[#1a1a1a]">
          <VideoHeader title="Q4 마케팅 전략 발표" step={step} onExit={handleExitClick} />

          <main className="flex-1 w-full flex flex-col items-center justify-center p-6 min-h-0 overflow-hidden">
            <div className="w-full h-full max-w-[1000px] flex flex-col items-center justify-center">
              {step === 'TEST' ? (
                <DeviceTestSection onNext={() => setStep('RECORDING')} />
              ) : (
                <h2 className="text-2xl font-bold text-white">녹화 진행 중</h2>
              )}
            </div>
          </main>
        </div>
      )}

      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="테스트 종료"
        size="sm"
      >
        <div className="flex flex-col gap-6">
          <p className="text-sm">정말로 중단하시겠습니까?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsExitModalOpen(false)}
              className="flex-1 py-3 bg-gray-100 rounded-md font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirmExit}
              className="flex-1 py-3 bg-error text-white rounded-md font-bold hover:bg-error/90 transition-colors"
            >
              종료
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoPage;
