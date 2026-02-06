import { useCallback, useRef, useState } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const requestRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const drawCanvas = useCallback(
    (camEl: HTMLVideoElement, slideImgRef: React.MutableRefObject<HTMLImageElement | null>) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const render = () => {
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (slideImgRef.current?.complete) {
          const slideW = canvas.width * 0.82;
          const slideH = (slideImgRef.current.height / slideImgRef.current.width) * slideW;
          ctx.drawImage(
            slideImgRef.current,
            (canvas.width - slideW) / 2,
            (canvas.height - slideH) / 2,
            slideW,
            slideH,
          );
        }

        if (camEl.readyState >= 2 && camEl.videoWidth > 0) {
          const camW = canvas.width * 0.22;
          const camH = (camEl.videoHeight / camEl.videoWidth) * camW;
          const margin = canvas.width * 0.04;
          const camX = canvas.width - camW - margin;
          const camY = canvas.height - camH - margin;

          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 30 * (canvas.width / 1920);

          ctx.beginPath();
          const radius = 24 * (canvas.width / 1920);
          ctx.roundRect(camX, camY, camW, camH, radius);
          ctx.clip();

          ctx.drawImage(camEl, camX, camY, camW, camH);
          ctx.restore();
        }

        requestRef.current = requestAnimationFrame(render);
      };

      render();
    },
    [],
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
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
      if (!canvasRef.current || !camStream.active) return;

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
        drawCanvas(camVideo, slideImgRef);

        const canvasStream = canvasRef.current.captureStream(30);
        camStream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));

        const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(
          (type) => MediaRecorder.isTypeSupported(type),
        );

        const recorder = new MediaRecorder(canvasStream, { mimeType });

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
    [drawCanvas, stopRecording],
  );

  return {
    canvasRef,
    isRecording,
    recordedChunks,
    startRecording,
    stopRecording,
  };
};
