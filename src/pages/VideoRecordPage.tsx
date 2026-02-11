import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { toast } from 'sonner';

import { Layout, Logo, Modal } from '@/components/common';
import { DeviceTestSection, RecordingSection, StopButton } from '@/components/video';
import { usePresentation } from '@/hooks/queries/usePresentations';
import { useVideoUpload } from '@/hooks/useVideoUpload';

type RecordStep = 'TEST' | 'RECORDING';

export default function VideoRecordPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: presentation } = usePresentation(projectId!);

  const [step, setStep] = useState<RecordStep>('TEST');
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const { uploadVideo, progress } = useVideoUpload();
  const UPLOAD_TOAST_ID = 'video-upload';
  const uploadToastRef = useRef<string | number | null>(null);

  useEffect(() => {
    switch (progress.currentStep) {
      case 'uploading':
        uploadToastRef.current = toast.loading('영상 업로드 중...', {
          id: UPLOAD_TOAST_ID,
          description: `${progress.uploadedChunks} / ${progress.totalChunks} 청크 (${progress.percentage}%)`,
        });
        break;
      case 'finishing':
        uploadToastRef.current = toast.loading('영상 처리 중...', {
          id: UPLOAD_TOAST_ID,
          description: '서버에서 영상을 처리하고 있습니다',
        });
        break;
      case 'done':
        toast.dismiss(UPLOAD_TOAST_ID);
        uploadToastRef.current = null;
        break;
    }
  }, [progress]);

  // 컴포넌트 언마운트 시 토스트 정리
  useEffect(() => {
    return () => {
      if (uploadToastRef.current) {
        toast.dismiss(UPLOAD_TOAST_ID);
      }
    };
  }, []);

  const handleTestComplete = (streams: { cam: MediaStream }) => {
    streamRef.current = streams.cam;
    setCamStream(streams.cam);
    setStep('RECORDING');
  };

  const handleRecordingFinish = async (videoBlob: Blob, durations: { [key: number]: number }) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCamStream(null);
    }

    if (!videoBlob || videoBlob.size === 0) {
      toast.error('녹화된 영상이 없습니다.');
      return;
    }

    try {
      const numericProjectId = projectId ? parseInt(projectId.replace(/\D/g, ''), 10) : 1;
      const title = presentation?.title || '제목 없음';

      const slideLogs = Object.entries(durations)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([pageNum], index, arr) => {
          const previousDuration = arr
            .slice(0, index)
            .reduce((sum, [, dur]) => sum + Number(dur), 0);

          return {
            slideId: Number(pageNum),
            timestampMs: Math.round(previousDuration * 1000),
          };
        });

      console.log('[VideoRecordPage] slideLogs:', slideLogs);

      const videoId = await uploadVideo(videoBlob, numericProjectId, title, slideLogs);

      // 업로드 성공 시 토스트 dismiss 후 이동
      toast.dismiss(UPLOAD_TOAST_ID);

      if (videoId) {
        // 약간의 딜레이 후 이동 (토스트가 완전히 사라지도록)
        setTimeout(() => {
          navigate(`/${projectId}/videos`, { state: { uploadSuccess: true } });
        }, 100);
      }
    } catch (err: unknown) {
      toast.dismiss(UPLOAD_TOAST_ID);
      console.error('[VideoRecordPage] Upload error:', err);
      toast.error('업로드 실패', { description: (err as Error).message });
    }
  };

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCamStream(null);
    setIsExitModalOpen(false);
    toast.dismiss(UPLOAD_TOAST_ID);
    navigate(`/${projectId}/slide`);
  };

  return (
    <Layout
      theme="dark"
      left={
        <>
          <Logo onClick={handleExitClick} />
          <span className="text-body-m-bold text-white">영상 녹화</span>
        </>
      }
      right={
        <StopButton label={step === 'RECORDING' ? '녹화 중단' : '종료'} onClick={handleExitClick} />
      }
    >
      <div className="relative h-full w-full bg-white">
        {step === 'TEST' ? (
          <div className="h-full w-full flex items-center justify-center">
            <DeviceTestSection onComplete={handleTestComplete} />
          </div>
        ) : (
          camStream && (
            <>
              <RecordingSection
                projectId={projectId!}
                initialStream={camStream}
                onFinish={handleRecordingFinish}
                onExitClick={handleExitClick}
              />
            </>
          )
        )}

        <Modal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          title={step === 'RECORDING' ? '녹화 중단' : '테스트 종료'}
          size="sm"
        >
          <p className="text-body-m">
            {step === 'RECORDING' ? (
              <>
                녹화를 중단하시겠습니까?
                <br />
                저장되지 않은 데이터는 삭제됩니다.
              </>
            ) : (
              '테스트를 종료하시겠습니까?'
            )}
          </p>
          <div className="mt-7 flex gap-3">
            <button
              onClick={() => setIsExitModalOpen(false)}
              className="flex-1 rounded-md bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              type="button"
            >
              취소
            </button>
            <button
              onClick={handleConfirmExit}
              className="flex-1 rounded-md bg-error py-3 font-bold text-white hover:bg-error/90 transition-colors"
              type="button"
            >
              종료
            </button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
