import { useCallback, useEffect, useState } from 'react';

import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';

interface UseVideoSyncOptions {
  /** 네이티브 controls 사용 시 onTimeUpdate 이벤트 핸들러로 동기화 (기본: false) */
  useNativeControls?: boolean;
}

interface UseVideoSyncReturn {
  /** 비디오 요소에 연결할 콜백 ref */
  setVideoRef: (el: HTMLVideoElement | null) => void;
  /** 비디오 요소 (직접 접근 필요 시) */
  videoElement: HTMLVideoElement | null;
  /** 비디오 총 길이 (초) */
  duration: number;
  /** 현재 재생 시간 (store에서 가져옴) */
  currentTime: number;
  /** 네이티브 controls 사용 시 video 태그에 연결할 핸들러 */
  handleTimeUpdate: () => void;
}

/**
 * 비디오-스토어 동기화 훅
 *
 * 비디오 요소의 timeupdate를 store.currentTime에,
 * store.seekTo 요청을 video.currentTime에 양방향 동기화합니다.
 *
 * @param options.useNativeControls - 네이티브 controls 사용 여부 (기본: false)
 * @returns setVideoRef - 비디오 요소에 연결할 콜백 ref
 * @returns videoElement - 비디오 요소 (직접 접근 필요 시)
 * @returns duration - 비디오 총 길이 (초)
 * @returns currentTime - 현재 재생 시간
 * @returns handleTimeUpdate - 네이티브 controls용 onTimeUpdate 핸들러
 */
export function useVideoSync(options: UseVideoSyncOptions = {}): UseVideoSyncReturn {
  const { useNativeControls = false } = options;

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [hasRestoredTime, setHasRestoredTime] = useState(false);

  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const seekTo = useVideoFeedbackStore((s) => s.seekTo);
  const clearSeek = useVideoFeedbackStore((s) => s.clearSeek);

  // 콜백 ref - 비디오 요소가 마운트/언마운트될 때 호출
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    console.log('[useVideoSync] setVideoRef called:', el ? 'video element' : 'null');
    setVideoElement(el);
    setHasRestoredTime(false); // 비디오가 바뀌면 복원 플래그 리셋
  }, []);

  // 네이티브 controls 사용 시 onTimeUpdate 핸들러
  const handleTimeUpdate = useCallback(() => {
    const t = videoElement?.currentTime ?? 0;
    updateCurrentTime(t);
  }, [updateCurrentTime, videoElement]);

  // 커스텀 컨트롤 사용 시: 이벤트 리스너로 동기화
  useEffect(() => {
    if (useNativeControls) return;
    if (!videoElement) return;

    console.log('[useVideoSync] Setting up video event listeners');

    const onLoadedMetadata = () => {
      const d = Number.isFinite(videoElement.duration) ? videoElement.duration : 0;
      console.log('[useVideoSync] Video metadata loaded, duration:', d);
      setDuration(d);

      // 최초 1회만 복원 (비디오 전환 시 이전 시간으로 복원)
      if (!hasRestoredTime) {
        const storedTime = useVideoFeedbackStore.getState().currentTime;
        console.log(
          '[useVideoSync] Stored time:',
          storedTime,
          'Video time:',
          videoElement.currentTime,
        );

        if (storedTime > 0 && Math.abs(videoElement.currentTime - storedTime) > 0.5) {
          console.log('[useVideoSync] Restoring time to:', storedTime);
          // eslint-disable-next-line react-hooks/immutability -- DOM API
          videoElement.currentTime = storedTime;
        }
        setHasRestoredTime(true);
      }
    };

    const onTimeUpdate = () => {
      updateCurrentTime(videoElement.currentTime);
    };

    const onError = (e: Event) => {
      console.error('[useVideoSync] Video error:', {
        error: videoElement.error,
        code: videoElement.error?.code,
        message: videoElement.error?.message,
      });
    };

    videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
    videoElement.addEventListener('timeupdate', onTimeUpdate);
    videoElement.addEventListener('error', onError);

    // 이미 로드된 경우 duration 설정 및 시간 복원
    if (videoElement.readyState >= 1 && Number.isFinite(videoElement.duration)) {
      console.log('[useVideoSync] Video already loaded, duration:', videoElement.duration);
      setDuration(videoElement.duration);

      // 최초 1회만 복원
      if (!hasRestoredTime) {
        const storedTime = useVideoFeedbackStore.getState().currentTime;
        console.log(
          '[useVideoSync] Already loaded - Stored time:',
          storedTime,
          'Video time:',
          videoElement.currentTime,
        );

        if (storedTime > 0 && Math.abs(videoElement.currentTime - storedTime) > 0.5) {
          console.log('[useVideoSync] Already loaded - Restoring time to:', storedTime);
          // eslint-disable-next-line react-hooks/immutability -- DOM API
          videoElement.currentTime = storedTime;
        }
        setHasRestoredTime(true);
      }
    }

    return () => {
      console.log('[useVideoSync] Cleaning up video event listeners');
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
      videoElement.removeEventListener('error', onError);
    };
  }, [useNativeControls, updateCurrentTime, videoElement, hasRestoredTime]);

  // store.seekTo 요청 처리
  useEffect(() => {
    if (!videoElement) return;
    if (seekTo == null) return;

    console.log('[useVideoSync] Seeking to:', seekTo);

    // eslint-disable-next-line react-hooks/immutability -- DOM API
    videoElement.currentTime = seekTo;

    // 커스텀 컨트롤 사용 시에만 currentTime 업데이트 (네이티브는 onTimeUpdate에서 처리)
    if (!useNativeControls) {
      updateCurrentTime(seekTo);
    }

    clearSeek();
  }, [seekTo, clearSeek, useNativeControls, updateCurrentTime, videoElement]);

  return {
    setVideoRef,
    videoElement,
    duration,
    currentTime,
    handleTimeUpdate,
  };
}
