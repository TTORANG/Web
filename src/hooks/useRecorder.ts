import { useCallback, useRef, useState } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const requestRef = useRef<number | null>(null);

  const drawCanvas = useCallback(
    (camEl: HTMLVideoElement, slideImgRef: React.MutableRefObject<HTMLImageElement | null>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const render = () => {
        ctx.fillStyle = '#121418';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (slideImgRef.current && slideImgRef.current.complete) {
          const img = slideImgRef.current;
          const drawW = 1365;
          const drawH = 766;
          ctx.drawImage(img, (canvas.width - drawW) / 2, (canvas.height - drawH) / 2, drawW, drawH);
        }

        if (camEl.videoWidth > 0) {
          const camW = 370;
          const camH = 206;
          const margin = 50;

          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 40;

          ctx.beginPath();
          ctx.roundRect(
            canvas.width - camW - margin,
            canvas.height - camH - margin,
            camW,
            camH,
            24,
          );
          ctx.clip();

          ctx.drawImage(
            camEl,
            canvas.width - camW - margin,
            canvas.height - camH - margin,
            camW,
            camH,
          );
          ctx.restore();
        }

        requestRef.current = requestAnimationFrame(render);
      };
      render();
    },
    [],
  );

  const startRecording = async (
    camStream: MediaStream,
    slideImgRef: React.MutableRefObject<HTMLImageElement | null>,
  ) => {
    if (!canvasRef.current) return;

    const camVideo = document.createElement('video');
    camVideo.srcObject = camStream;
    camVideo.muted = true;
    camVideo.playsInline = true;

    camVideo.onloadedmetadata = async () => {
      try {
        await camVideo.play();
        setIsRecording(true);
        setRecordedChunks([]);

        drawCanvas(camVideo, slideImgRef);

        const combinedStream = canvasRef.current!.captureStream(30);
        const audioTracks = camStream.getAudioTracks();
        if (audioTracks.length > 0) combinedStream.addTrack(audioTracks[0]);

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 5000000,
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.error('캔버스 내 비디오 재생 실패:', err);
      }
    };
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
    setIsRecording(false);
  };

  return { canvasRef, isRecording, startRecording, stopRecording, recordedChunks };
};
