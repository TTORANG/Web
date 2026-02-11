import { useCallback, useRef, useState } from 'react';

/**
 * 카메라 영상 녹화 훅
 *
 * 카메라 영상만 WebM으로 녹화합니다.
 */
export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      if (videoRef.current.parentNode) {
        document.body.removeChild(videoRef.current);
      }
      videoRef.current = null;
    }

    setIsRecording(false);
  }, []);

  const startRecording = useCallback(
    async (
      camStream: MediaStream,
      slideImgRef: React.MutableRefObject<HTMLImageElement | null>,
      onChunk?: (blob: Blob) => void,
    ) => {
      if (!camStream.active) return;

      const camVideo = document.createElement('video');
      camVideo.srcObject = camStream;
      camVideo.muted = true;
      camVideo.playsInline = true;
      camVideo.autoplay = true;

      Object.assign(camVideo.style, {
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        opacity: '0',
      });
      document.body.appendChild(camVideo);
      videoRef.current = camVideo;

      try {
        await camVideo.play();

        const isVideoReady = await new Promise<boolean>((resolve) => {
          let attempts = 0;
          const check = () => {
            if (camVideo.readyState >= 2 && camVideo.videoWidth > 0) resolve(true);
            else if (attempts > 30) resolve(false);
            else {
              attempts++;
              setTimeout(check, 100);
            }
          };
          check();
        });

        if (!isVideoReady) throw new Error('Video timeout');

        setIsRecording(true);
        setRecordedChunks([]);

        // Canvas 합성 제거 - 캠 스트림만 직접 녹화
        const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(
          (type) => MediaRecorder.isTypeSupported(type),
        );

        const recorder = new MediaRecorder(camStream, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setRecordedChunks((prev) => [...prev, e.data]);
            if (onChunk) onChunk(e.data);
          }
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch {
        stopRecording();
      }
    },
    [stopRecording],
  );

  return {
    isRecording,
    recordedChunks,
    startRecording,
    stopRecording,
  };
};
