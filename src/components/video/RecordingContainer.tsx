import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DeviceTestSection } from './DeviceTestSection';
import { RecordingSection } from './RecordingSection';

const RecordingContainer = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'TEST' | 'RECORDING'>('TEST');
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleTestComplete = (streams: { cam: MediaStream }) => {
    streamRef.current = streams.cam;
    setCamStream(streams.cam);
    setStep('RECORDING');
  };

  const handleRecordingFinish = (videoBlob: Blob, durations: { [key: number]: number }) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setCamStream(null);
    }

    if (!videoBlob || videoBlob.size === 0) {
      alert('녹화된 영상이 없습니다.');
      return;
    }

    const mockVideoId = Date.now();
    const videoData = {
      id: mockVideoId,
      title: 'Q4 마케팅 전략 발표',
      createdAt: new Date().toISOString(),
      durationSeconds: Object.values(durations).reduce((sum, d) => sum + d, 0),
      slideCount: Object.keys(durations).length,
      size: videoBlob.size,
    };

    try {
      const existingVideos = JSON.parse(localStorage.getItem('mockVideos') || '[]');

      existingVideos.unshift(videoData);
      localStorage.setItem('mockVideos', JSON.stringify(existingVideos));

      navigate('/videos', {
        state: { uploadSuccess: true, videoId: mockVideoId },
        replace: true,
      });
    } catch (error) {
      alert(
        '영상 저장에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  return (
    <div className="h-full w-full bg-[#1A1A1A]">
      {step === 'TEST' ? (
        <DeviceTestSection onComplete={handleTestComplete} />
      ) : (
        camStream && (
          <RecordingSection
            title="Q4 마케팅 전략 발표"
            initialStream={camStream}
            onFinish={handleRecordingFinish}
          />
        )
      )}
    </div>
  );
};

export { RecordingContainer };
export default RecordingContainer;
