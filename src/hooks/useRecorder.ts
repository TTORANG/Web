import { useCallback, useRef, useState } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const requestRef = useRef<number | null>(null);

  const drawCanvas = useCallback((videoEl: HTMLVideoElement, camEl: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const render = () => {
      ctx.fillStyle = '#1a1c21';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      const camWidth = canvas.width * 0.18;
      const camHeight = (camEl.videoHeight / camEl.videoWidth) * camWidth;

      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.drawImage(
        camEl,
        canvas.width - camWidth - 40,
        canvas.height - camHeight - 40,
        camWidth,
        camHeight,
      );
      ctx.shadowBlur = 0;

      requestRef.current = window.requestAnimationFrame(render);
    };
    render();
  }, []);

  const startRecording = async (slideStream: MediaStream, camStream: MediaStream) => {
    if (!canvasRef.current) return;

    const slideVideo = document.createElement('video');
    slideVideo.srcObject = slideStream;
    slideVideo.muted = true;
    slideVideo.play();

    const camVideo = document.createElement('video');
    camVideo.srcObject = camStream;
    camVideo.muted = true;
    camVideo.play();

    drawCanvas(slideVideo, camVideo);

    const combinedStream = canvasRef.current.captureStream(30);
    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();

    if (slideStream.getAudioTracks().length > 0) {
      audioContext.createMediaStreamSource(slideStream).connect(dest);
    }
    if (camStream.getAudioTracks().length > 0) {
      audioContext.createMediaStreamSource(camStream).connect(dest);
    }

    const finalStream = new MediaStream([
      ...combinedStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    const recorder = new MediaRecorder(finalStream, { mimeType: 'video/webm;codecs=vp9' });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (requestRef.current !== null) {
      window.cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setIsRecording(false);
  };

  return { canvasRef, isRecording, startRecording, stopRecording, recordedChunks };
};
