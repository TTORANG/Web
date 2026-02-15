import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/api';
import { Layout } from '@/components/common/layout/Layout';
import { Logo } from '@/components/common/layout/Logo';
import {
  DeviceTestSection,
  RecordExitModal,
  RecordingSection,
  StopButton,
} from '@/components/video';
import { getTabPath } from '@/constants/navigation';
import { usePresentation } from '@/hooks/queries/usePresentations';
import { useSlides } from '@/hooks/queries/useSlides';
import { useVideoUpload } from '@/hooks/useVideoUpload';

type RecordStep = 'TEST' | 'RECORDING';

export default function VideoRecordPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const handleRecordingFinish = async (
    videoBlob: Blob,
    slideLogs: { slideId: number; timestampMs: number }[],
  ) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCamStream(null);
    }

    if (!videoBlob || videoBlob.size === 0) {
      toast.error('녹화 파일을 확인할 수 없습니다.');
      return;
    }

    if (slideLogs.length === 0) {
      toast.error('슬라이드 기록이 올바르지 않습니다.', {
        description: '다시 녹화해주세요.',
      });
      return;
    }

    try {
      const numericProjectId = projectId ? parseInt(projectId.replace(/\D/g, ''), 10) : 1;
      const title = presentation?.title || '제목 없음';

      const videoId = await uploadVideo(videoBlob, numericProjectId, title, slideLogs);

      if (videoId) {
        if (projectId) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.shares.videos(projectId) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.videos.list(projectId) }),
          ]);
        }

        setTimeout(() => {
          navigate(`/${projectId}/videos`, { state: { uploadSuccess: true } });
        }, 500);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (!projectId) {
      navigate('/');
      return;
    }

    navigate(getTabPath(projectId, 'slide'));
  };

  return (
    <Layout
      theme="dark"
      left={
        <>
          <Logo onClick={handleExitClick} />
          <span className="text-body-m-bold" style={{ color: '#FFFFFF' }}>
            영상 녹화
          </span>{' '}
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
