import { useCallback, useRef, useState } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const requestRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /**
   * 캔버스에 슬라이드와 웹캠을 합성하여 그리는 루프
   */
  const drawCanvas = useCallback(
    (camEl: HTMLVideoElement, slideImgRef: React.MutableRefObject<HTMLImageElement | null>) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const render = () => {
        // 1. 배경 초기화 (Grayscale/Black)
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. 슬라이드 그리기 (82% 너비, 중앙 배치)
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

        // 3. 웹캠 그리기 (우측 하단, 22% 너비, 둥근 모서리)
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

  /**
   * 녹화 시작 함수
   */
  const startRecording = useCallback(
    async (
      camStream: MediaStream,
      slideImgRef: React.MutableRefObject<HTMLImageElement | null>,
      onChunk?: (blob: Blob) => void,
    ) => {
      if (!canvasRef.current || !camStream.active) return;

      // 1. 오프스크린 비디오 엘리먼트 생성 및 설정
      const camVideo = document.createElement('video');
      camVideo.srcObject = camStream;
      camVideo.muted = true;
      camVideo.playsInline = true;
      camVideo.autoplay = true;

      // 스타일을 통해 화면에서 숨김 처리
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

        // 2. 비디오 준비 대기 (최대 3초)
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

        // 3. 녹화 및 스트림 설정
        setIsRecording(true);
        setRecordedChunks([]); // 새 녹화 시작 시 초기화
        drawCanvas(camVideo, slideImgRef);

        const canvasStream = canvasRef.current.captureStream(30);
        camStream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));

        // 4. MediaRecorder 설정
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

        recorder.start(1000); // 1초 단위 청크 생성
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.error('Failed to start recording:', err);
        stopRecording();
      }
    },
    [drawCanvas],
  );

  /**
   * 녹화 중지 및 자원 해제
   */
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

  return {
    canvasRef,
    isRecording,
    recordedChunks,
    startRecording,
    stopRecording,
  };
};
