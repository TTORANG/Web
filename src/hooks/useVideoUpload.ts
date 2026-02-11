import { useState } from 'react';

import { videosApi } from '@/api/endpoints/videos';

interface UploadProgress {
  uploadedChunks: number;
  totalChunks: number;
  percentage: number;
  currentStep: 'preparing' | 'uploading' | 'finishing' | 'done';
}

interface SlideLog {
  slideId: number;
  timestampMs: number;
}

/**
 * 영상 청크 업로드 훅
 *
 * 영상을 1MB 단위 청크로 분할하여 순차 업로드하고, 진행률을 추적합니다.
 *
 * @returns uploadVideo - 영상 업로드 함수 (videoId 반환, 실패 시 null)
 * @returns isUploading - 업로드 진행 중 여부
 * @returns progress - 업로드 진행 상태 (청크 수, 퍼센트, 단계)
 * @returns error - 에러 메시지
 */
// VideoRecordPage.tsx 내부 handleRecordingFinish 함수

// useVideoUpload.ts
// ... (상단 import 동일)

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    uploadedChunks: 0,
    totalChunks: 0,
    percentage: 0,
    currentStep: 'preparing',
  });
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (
    videoBlob: Blob,
    projectId: number,
    title: string,
    slideLogs: SlideLog[],
  ): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // 1. 시작 요청
      const startResponse = await videosApi.startVideo({ projectId, title });
      if (startResponse.data.resultType === 'FAILURE')
        throw new Error(startResponse.data.error.reason);

      const videoId = startResponse.data.success.videoId;
      const CHUNK_SIZE = 1024 * 1024; // 1MB
      const totalChunks = Math.ceil(videoBlob.size / CHUNK_SIZE);

      // 2. 청크 업로드
      setProgress((prev) => ({ ...prev, totalChunks, currentStep: 'uploading' }));
      for (let i = 0; i < totalChunks; i++) {
        const chunk = videoBlob.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE, 'video/webm');
        const uploadRes = await videosApi.uploadChunk(videoId, i, chunk);
        if (uploadRes.data.resultType === 'FAILURE') throw new Error(`Chunk ${i} 업로드 실패`);

        setProgress((prev) => ({
          ...prev,
          uploadedChunks: i + 1,
          percentage: Math.round(((i + 1) / totalChunks) * 100),
        }));
      }

      // 3. 종료(병합) 요청
      setProgress((prev) => ({ ...prev, currentStep: 'finishing' }));
      const finishRes = await videosApi.finishVideo(videoId, { slideLogs });
      if (finishRes.data.resultType === 'FAILURE') throw new Error('영상 처리 요청 실패');

      setProgress((prev) => ({ ...prev, currentStep: 'done' }));
      return videoId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '업로드 에러';
      setError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadVideo, isUploading, progress, error };
};
