/**
 * @file VideoRecordPage.tsx
 * @description 영상 녹화 페이지 (웹캠/마이크 테스트 및 녹화)
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Modal } from '@/components/common';
import { DeviceTestSection } from '@/components/video';

type RecordStep = 'TEST' | 'RECORDING';

export default function VideoRecordPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<RecordStep>('TEST');
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    navigate(`/${projectId}/video`);
  };

  return (
    <div className="relative h-full w-full">
      {/* 헤더 오른쪽 영역에 종료 버튼 (Layout 헤더 위에 배치) */}
      <button
        onClick={handleExitClick}
        className="fixed top-0 right-18 z-50 h-15 flex items-center px-4 py-1.5 text-caption-bold text-black hover:text-gray-600 transition-colors"
      >
        {step === 'RECORDING' ? '녹화 중단' : '종료'}
      </button>

      {/* 본문 */}
      <main className="h-full w-full flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="w-full h-full max-w-250 flex flex-col items-center justify-center">
          {step === 'TEST' ? (
            <DeviceTestSection onNext={() => setStep('RECORDING')} />
          ) : (
            <h2 className="text-2xl font-bold text-black">녹화 진행 중</h2>
          )}
        </div>
      </main>

      {/* 종료 확인 모달 */}
      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="테스트 종료"
        size="sm"
      >
        <div className="flex flex-col gap-6">
          <p className="text-sm">중단하시겠습니까?</p>
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
}
