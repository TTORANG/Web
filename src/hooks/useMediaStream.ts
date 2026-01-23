/**
 * 미디어 스트림 훅
 *
 * 카메라/마이크 스트림과 오디오 볼륨 분석을 제공합니다.
 *
 * @param videoDeviceId - 비디오 장치 ID
 * @param audioDeviceId - 오디오 장치 ID
 * @returns stream - MediaStream 객체
 * @returns volume - 현재 오디오 볼륨 (0-255)
 * @returns error - 에러 메시지
 * @returns isLoading - 스트림 로딩 중 여부
 * @returns restartStream - 스트림 재시작 함수
 */
import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export const useMediaStream = (videoDeviceId?: string, audioDeviceId?: string) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const cleanupAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyzerRef.current = null;
  }, []);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    cleanupAudioAnalysis();
  }, [cleanupAudioAnalysis]);

  const setupAudioAnalysis = useCallback(
    (mediaStream: MediaStream) => {
      try {
        cleanupAudioAnalysis();

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyzer = audioContext.createAnalyser();

        analyzer.fftSize = 256;
        analyzer.smoothingTimeConstant = 0.8;
        source.connect(analyzer);

        audioContextRef.current = audioContext;
        analyzerRef.current = analyzer;
        sourceNodeRef.current = source;

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyzerRef.current) return;

          analyzerRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setVolume(Math.round(average));
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err) {
        console.error('오디오 분석 설정 실패:', err);
      }
    },
    [cleanupAudioAnalysis],
  );

  const startStream = useCallback(async () => {
    if (!videoDeviceId && !audioDeviceId) return;

    setIsLoading(true);
    setError(null);

    try {
      cleanupStream();

      const constraints: MediaStreamConstraints = {
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = newStream;
      setStream(newStream);
      setupAudioAnalysis(newStream);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '미디어 장치를 가져오는데 실패했습니다';
      console.error('미디어 스트림 에러:', err);
      setError(errorMessage);
      setStream(null);
    } finally {
      setIsLoading(false);
    }
  }, [videoDeviceId, audioDeviceId, cleanupStream, setupAudioAnalysis]);

  useEffect(() => {
    startStream();

    return () => {
      cleanupStream();
    };
  }, [videoDeviceId, audioDeviceId, startStream, cleanupStream]);

  return {
    stream,
    volume,
    error,
    isLoading,
    restartStream: startStream,
  };
};
