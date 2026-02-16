import { useCallback, useRef, useState } from 'react';

import { normalizeVideoMimeType } from '@/utils/video';

const RECORDER_MIME_CANDIDATES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
] as const;

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selectedMimeTypeRef = useRef<'video/webm' | 'video/mp4'>('video/webm');

  const stopRecording = useCallback(() => {
    return new Promise<void>((resolve) => {
      const finalize = () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
          if (videoRef.current.parentNode) {
            document.body.removeChild(videoRef.current);
          }
          videoRef.current = null;
        }
        setIsRecording(false);
        resolve();
      };

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        finalize();
        return;
      }

      mediaRecorderRef.current.onstop = finalize;
      mediaRecorderRef.current.stop();
    });
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

        const mimeType = RECORDER_MIME_CANDIDATES.find((type) =>
          MediaRecorder.isTypeSupported(type),
        );
        const recorder = mimeType
          ? new MediaRecorder(camStream, { mimeType })
          : new MediaRecorder(camStream);
        selectedMimeTypeRef.current = normalizeVideoMimeType(mimeType || recorder.mimeType);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
            setRecordedChunks((prev) => [...prev, e.data]);
          }
        };

        recorder.start(5000);
        mediaRecorderRef.current = recorder;
      } catch {
        stopRecording();
      }
    },
    [stopRecording],
  );

  const getRecordedBlob = useCallback(() => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: selectedMimeTypeRef.current });
  }, []);

  return {
    isRecording,
    recordedChunks,
    startRecording,
    stopRecording,
    getRecordedBlob,
  };
};
