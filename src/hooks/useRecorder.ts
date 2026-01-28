import { useCallback, useRef, useState } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const requestRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const drawCanvas = useCallback(
    (camEl: HTMLVideoElement, slideImgRef: React.MutableRefObject<HTMLImageElement | null>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const render = () => {
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (slideImgRef.current && slideImgRef.current.complete) {
          ctx.drawImage(slideImgRef.current, 16, 254, 1024, 575);
        }

        if (camEl && camEl.readyState >= 2) {
          ctx.drawImage(camEl, 763, 845, 277, 155);
        }
        requestRef.current = requestAnimationFrame(render);
      };
      render();
    },
    [],
  );

  const startRecording = useCallback(
    async (
      camStream: MediaStream,
      slideImgRef: React.MutableRefObject<HTMLImageElement | null>,
      onChunk: (blob: Blob) => void, // 청크 처리 콜백 추가
    ) => {
      if (!canvasRef.current || !camStream) return;

      const camVideo = document.createElement('video');
      camVideo.srcObject = camStream;
      camVideo.muted = true;
      camVideo.playsInline = true;
      videoRef.current = camVideo;

      camVideo.onloadedmetadata = async () => {
        try {
          await camVideo.play();
          setIsRecording(true);
          drawCanvas(camVideo, slideImgRef);

          const combinedStream = canvasRef.current!.captureStream(30);
          camStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));

          const recorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp9',
          });

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) onChunk(e.data); // 여기서 바로 업로드 로직 실행
          };

          recorder.start(5000); // 5초 단위로 청크 생성 (GCS 업로드 부하 고려)
          mediaRecorderRef.current = recorder;
        } catch (err) {
          console.error('Recording Start Error:', err);
        }
      };
    },
    [drawCanvas],
  );

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  return { canvasRef, isRecording, startRecording, stopRecording };
};
