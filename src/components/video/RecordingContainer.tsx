import { useState } from 'react';

import { DeviceTestSection } from './DeviceTestSection';
import { RecordingSection } from './RecordingSection';

export const RecordingContainer = () => {
  // 1. 현재 어떤 화면을 보여줄지 결정하는 상태
  const [step, setStep] = useState<'TEST' | 'RECORDING'>('TEST');
  const [camStream, setCamStream] = useState<MediaStream | null>(null);

  // 2. 버튼 클릭 시 실행될 함수
  const handleTestComplete = (streams: { cam: MediaStream }) => {
    setCamStream(streams.cam);
    setStep('RECORDING'); // 이 상태가 바뀌어야 화면이 교체됨
  };

  return (
    <div className="h-full w-full">
      {/* 3. step 값에 따라 화면을 갈아끼움 */}
      {step === 'TEST' ? (
        <DeviceTestSection onComplete={handleTestComplete} />
      ) : (
        camStream && (
          <RecordingSection
            title="Q4 마케팅 전략 발표"
            initialStream={camStream}
            onFinish={(blob, logs) => console.log(blob, logs)}
          />
        )
      )}
    </div>
  );
};
