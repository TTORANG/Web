/**
 * @file useVideoSync.ts
 * @description 비디오 요소와 store 간 동기화를 담당하는 훅
 *
 * - videoRef 관리
 * - duration 상태 관리
 * - timeupdate 이벤트 → store.currentTime 동기화
 * - store.seekTo 요청 → video.currentTime 동기화
 */
import { useEffect, useRef, useState } from 'react';

import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';

interface UseVideoSyncOptions {
  /** 네이티브 controls 사용 시 onTimeUpdate 이벤트 핸들러로 동기화 (기본: false) */
  useNativeControls?: boolean;
}

interface UseVideoSyncReturn {
  /** 비디오 요소 ref */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** 비디오 총 길이 (초) */
  duration: number;
  /** 현재 재생 시간 (store에서 가져옴) */
  currentTime: number;
  /** 네이티브 controls 사용 시 video 태그에 연결할 핸들러 */
  handleTimeUpdate: () => void;
}

export function useVideoSync(options: UseVideoSyncOptions = {}): UseVideoSyncReturn {
  const { useNativeControls = false } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(0);

  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const seekTo = useVideoFeedbackStore((s) => s.seekTo);
  const clearSeek = useVideoFeedbackStore((s) => s.clearSeek);

  // 네이티브 controls 사용 시 onTimeUpdate 핸들러
  const handleTimeUpdate = () => {
    const t = videoRef.current?.currentTime ?? 0;
    updateCurrentTime(t);
  };

  // 커스텀 컨트롤 사용 시: 이벤트 리스너로 동기화
  useEffect(() => {
    if (useNativeControls) return; // 네이티브 controls는 onTimeUpdate 사용

    const el = videoRef.current;
    if (!el) return;

    const onLoadedMetadata = () => {
      const d = Number.isFinite(el.duration) ? el.duration : 0;
      setDuration(d);
    };

    const onTimeUpdate = () => {
      updateCurrentTime(el.currentTime);
    };

    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('timeupdate', onTimeUpdate);

    // 이미 로드된 경우 duration 설정
    if (el.readyState >= 1 && Number.isFinite(el.duration)) {
      setDuration(el.duration);
    }

    return () => {
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [useNativeControls, updateCurrentTime]);

  // store.seekTo 요청 처리
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (seekTo == null) return;

    el.currentTime = seekTo;

    // 커스텀 컨트롤 사용 시에만 currentTime 업데이트 (네이티브는 onTimeUpdate에서 처리)
    if (!useNativeControls) {
      updateCurrentTime(seekTo);
    }

    clearSeek();
  }, [seekTo, clearSeek, useNativeControls, updateCurrentTime]);

  return {
    videoRef,
    duration,
    currentTime,
    handleTimeUpdate,
  };
}
