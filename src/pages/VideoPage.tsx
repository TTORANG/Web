import React, { useState } from 'react';

import { DeviceTestSection, RecordingEmptySection, RecordingHeader } from '@/components/video';

type VideoStep = 'EMPTY' | 'TEST' | 'RECORDING';

const VideoPage = () => {
  const [step, setStep] = useState<VideoStep>('EMPTY');

  return (
    <div className="h-screen w-full bg-[#f8f9fa] flex flex-col overflow-hidden">
      <RecordingHeader title="Q4 마케팅 전략 발표" onExit={() => window.history.back()} />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {step === 'EMPTY' && <RecordingEmptySection onStart={() => setStep('TEST')} />}

        {step === 'TEST' && (
          <div className="fixed inset-0 z-50 mt-16 bg-[#1a1a1a]">
            <DeviceTestSection onNext={() => setStep('RECORDING')} />
          </div>
        )}

        {step === 'RECORDING' && (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-800">녹화 진행 중...</h2>
            <button onClick={() => setStep('EMPTY')} className="text-sm underline text-gray-400">
              테스트를 위해 처음으로 돌아가기
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoPage;
