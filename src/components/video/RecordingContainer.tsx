// src/components/video/RecordingContainer.tsx
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
    console.log('🎯 RecordingContainer - handleRecordingFinish 호출됨');
    console.log('📦 받은 데이터:', {
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

    // Mock 영상 데이터 저장
    const mockVideoId = Date.now();
    const videoData = {
      id: mockVideoId,
      title: 'Q4 마케팅 전략 발표',
      createdAt: new Date().toISOString(),
      durationSeconds: Object.values(durations).reduce((sum, d) => sum + d, 0),
      slideCount: Object.keys(durations).length,
      size: videoBlob.size,
    };

    console.log('💾 저장할 데이터:', videoData);

    try {
      // localStorage에 저장
      const existingVideos = JSON.parse(localStorage.getItem('mockVideos') || '[]');
      console.log('📂 기존 영상 수:', existingVideos.length);

      existingVideos.unshift(videoData);
      localStorage.setItem('mockVideos', JSON.stringify(existingVideos));

      console.log('✅ localStorage 저장 완료');
      console.log('🚀 navigate 호출 시작... (경로: /videos)');

      // 페이지 이동 - 동기적으로 즉시 실행
      navigate('/videos', {
        state: { uploadSuccess: true, videoId: mockVideoId },
        replace: true,
      });

      console.log('✅ navigate 호출 완료');
    } catch (error) {
      console.error('❌ 저장/이동 실패:', error);
      alert(
        '영상 저장에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  console.log('🔄 RecordingContainer 렌더링 - step:', step);

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
