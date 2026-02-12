import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { toast } from 'sonner';

import { Layout, Logo } from '@/components/common';
import {
  DeviceTestSection,
  RecordExitModal,
  RecordingSection,
  StopButton,
} from '@/components/video';
import { usePresentation } from '@/hooks/queries/usePresentations';
import { useSlides } from '@/hooks/queries/useSlides';
import { useVideoUpload } from '@/hooks/useVideoUpload';

type RecordStep = 'TEST' | 'RECORDING';

export default function VideoRecordPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: presentation } = usePresentation(projectId!);
  const { data: slidesData } = useSlides(projectId!);

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
      toast.error('녹화 파일을 확인할 수 없습니다.');
      return;
    }

    if (!slidesData || slidesData.length === 0) {
      toast.error('슬라이드 정보를 불러오지 못해 업로드를 중단했습니다.');
      return;
    }

    try {
      const numericProjectId = projectId ? parseInt(projectId.replace(/\D/g, ''), 10) : 1;
      const title = presentation?.title || '제목 없음';

      let accumulatedMs = 0;
      const slideLogs = Object.entries(durations)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([pageNum, duration]) => {
          const pageIdx = Number(pageNum) - 1;
          const slideId = slidesData[pageIdx]?.slideId;

          if (!slideId) return null;

          const log = {
            slideId: parseInt(slideId, 10),
            timestampMs: accumulatedMs,
          };

          const slideDuration = typeof duration === 'number' ? duration : 0;
          accumulatedMs += Math.round(slideDuration * 1000);

          return log;
        })
        .filter((log): log is { slideId: number; timestampMs: number } => log !== null);

      if (slideLogs.length === 0) {
        toast.error('슬라이드 기록이 올바르지 않습니다.', {
          description: '다시 녹화해주세요.',
        });
        return;
      }

      const videoId = await uploadVideo(videoBlob, numericProjectId, title, slideLogs);

      if (videoId) {
        setTimeout(() => {
          navigate(`/${projectId}/videos`, { state: { uploadSuccess: true } });
        }, 500);
      }
    } catch (err: unknown) {
      toast.error('업로드에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.',
      });
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
            <RecordingSection
              projectId={projectId!}
              initialStream={camStream}
              onFinish={handleRecordingFinish}
              onExitClick={handleExitClick}
            />
          )
        )}

        <RecordExitModal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          step={step}
          onConfirm={handleConfirmExit}
        />
      </div>
    </Layout>
  );
}
