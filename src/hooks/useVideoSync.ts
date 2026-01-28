/**
 * @file useVideoSync.ts
 * @description 비디오 요소와 store 간 동기화를 담당하는 훅
 *
 * - videoRef 관리
 * - duration 상태 관리
 * - timeupdate 이벤트 → store.currentTime 동기화
 * - store.seekTo 요청 → video.currentTime 동기화
 */
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

export function useVideoSync(options: UseVideoSyncOptions = {}): UseVideoSyncReturn {
  const { useNativeControls = false } = options;

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(0);

  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const seekTo = useVideoFeedbackStore((s) => s.seekTo);
  const clearSeek = useVideoFeedbackStore((s) => s.clearSeek);

  // 콜백 ref - 비디오 요소가 마운트/언마운트될 때 호출
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    console.log('[useVideoSync] setVideoRef called with:', el);
    setVideoElement(el);
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

    const onLoadedMetadata = () => {
      const d = Number.isFinite(videoElement.duration) ? videoElement.duration : 0;
      setDuration(d);
    };

    const onTimeUpdate = () => {
      updateCurrentTime(videoElement.currentTime);
    };

    videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
    videoElement.addEventListener('timeupdate', onTimeUpdate);

    // 이미 로드된 경우 duration 설정
    if (videoElement.readyState >= 1 && Number.isFinite(videoElement.duration)) {
      setDuration(videoElement.duration);
    }

    return () => {
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [useNativeControls, updateCurrentTime, videoElement]);

  // store.seekTo 요청 처리
  useEffect(() => {
    if (!videoElement) return;
    if (seekTo == null) return;

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
