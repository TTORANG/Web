import { useState } from 'react';

import { Logo } from '@/components/common';
import { DeviceTestSection, RecordingEmptySection } from '@/components/video';

type VideoStep = 'EMPTY' | 'TEST' | 'RECORDING';

export default function VideoPage() {
  const [step, setStep] = useState<VideoStep>('EMPTY');

  return (
    <div className="h-full w-full bg-gray-100 overflow-hidden">
      {step === 'EMPTY' && (
        <div className="h-full flex items-center justify-center">
          <RecordingEmptySection onStart={() => setStep('TEST')} />
        </div>
      )}

      {step === 'TEST' && (
        <div className="fixed inset-0 z-[100] bg-[#1a1a1a] flex flex-col overflow-hidden">
          {/* 다크 헤더 */}
          <header className="h-15 w-full flex items-center justify-between border-b border-white/10 bg-[#2a2d34] shrink-0 overflow-hidden">
            {' '}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-[2%] min-w-0 px-[4%]">
                <Logo />
              </div>
              <div className="hidden sm:block w-[1px] h-4 bg-white/20 flex-shrink-0" />
              <span className="text-body-m-bold text-white truncate min-w-0">
                Q4 마케팅 전략 발표
              </span>
            </div>
            <button
              onClick={() => setStep('EMPTY')}
              className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white border border-white/10 transition-colors"
            >
              종료
              <div className="w-2.5 h-2.5 bg-white rounded-sm" />
            </button>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
            <DeviceTestSection onNext={() => setStep('RECORDING')} />
          </main>
        </div>
      )}

      {/* 3. 녹화 진행 중 */}
      {step === 'RECORDING' && (
        <div className="fixed inset-0 z-[100] bg-[#1a1a1a] flex items-center justify-center">
          <h2 className="text-white text-2xl font-bold">녹화 진행 중</h2>
        </div>
      )}
    </div>
  );
}
