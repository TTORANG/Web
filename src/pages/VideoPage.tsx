import { useState } from 'react';

import { DeviceTestSection, RecordingEmptySection } from '@/components/video';

type VideoStep = 'EMPTY' | 'TEST' | 'RECORDING';

export default function VideoPage() {
  const [step, setStep] = useState<VideoStep>('EMPTY');

  return (
    <div className="h-full w-full">
      {step === 'EMPTY' && (
        <div className="h-full flex items-center justify-center bg-gray-100">
          <RecordingEmptySection onStart={() => setStep('TEST')} />
        </div>
      )}

      {step === 'TEST' && (
        <div className="fixed inset-0 z-[100] bg-[#1a1a1a] flex flex-col">
          <header className="h-15 px-18 flex items-center justify-between border-b border-white/10 bg-[#2a2d34]">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-[#5162ff] rounded-lg flex items-center justify-center text-white font-bold">
                L
              </div>
              <div className="w-[1px] h-4 bg-white/20" />
              <span className="text-body-m-bold text-white">Q4 마케팅 전략 발표</span>
            </div>

            <button
              onClick={() => setStep('EMPTY')}
              className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white transition-colors border border-white/10"
            >
              종료
              <div className="w-2.5 h-2.5 bg-white rounded-sm" />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#1a1a1a]">
            <DeviceTestSection onNext={() => setStep('RECORDING')} />
          </main>
        </div>
      )}

      {step === 'RECORDING' && (
        <div className="fixed inset-0 z-[100] bg-[#1a1a1a] flex items-center justify-center">
          <h2 className="text-white text-2xl font-bold">녹화 중 UI 구현부</h2>
        </div>
      )}
    </div>
  );
}
