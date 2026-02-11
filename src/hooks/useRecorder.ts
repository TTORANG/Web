import { useCallback, useRef, useState } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const chunksRef = useRef<Blob[]>([]);
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
    async (camStream: MediaStream) => {
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
        chunksRef.current = [];
        setRecordedChunks([]);

        const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(
          (type) => MediaRecorder.isTypeSupported(type),
        );

        const recorder = new MediaRecorder(camStream, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            // 현재까지 쌓인 청크 개수를 인덱스로 활용
            const chunkIndex = chunksRef.current.length;

            // [추가] 콘솔에 청크 정보 출력
            console.log(
              `[Recorder] Chunk #${chunkIndex} generated | Size: ${(e.data.size / 1024).toFixed(2)} KB`,
            );

            chunksRef.current.push(e.data);
            setRecordedChunks((prev) => [...prev, e.data]);
          }
        };

        recorder.start(3000);
        mediaRecorderRef.current = recorder;
      } catch {
        stopRecording();
      }
    },
    [stopRecording],
  );

  const getRecordedBlob = useCallback(() => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: 'video/webm' });
  }, []);

  return {
    isRecording,
    recordedChunks,
    startRecording,
    stopRecording,
    getRecordedBlob,
  };
};
