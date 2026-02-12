import { useState } from 'react';

import { videosApi } from '@/api/endpoints/videos';
import { normalizeVideoMimeType } from '@/utils/video';

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
      const startResponse = await videosApi.startVideo({ projectId, title });
      if (startResponse.data.resultType === 'FAILURE') {
        throw new Error(startResponse.data.error.reason);
      }

      const videoId = startResponse.data.success.videoId;
      const CHUNK_SIZE = 1024 * 1024;
      const totalChunks = Math.ceil(videoBlob.size / CHUNK_SIZE);
      const uploadMimeType = normalizeVideoMimeType(videoBlob.type);

      setProgress((prev) => ({ ...prev, totalChunks, currentStep: 'uploading' }));

      for (let i = 0; i < totalChunks; i++) {
        const chunk = videoBlob.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE, uploadMimeType);
        const uploadRes = await videosApi.uploadChunk(videoId, i, chunk);

        if (uploadRes.data.resultType === 'FAILURE') {
          throw new Error(`Chunk ${i} 업로드 실패`);
        }

        setProgress((prev) => ({
          ...prev,
          uploadedChunks: i + 1,
          percentage: Math.round(((i + 1) / totalChunks) * 100),
        }));
      }

      setProgress((prev) => ({ ...prev, currentStep: 'finishing' }));
      const finishRes = await videosApi.finishVideo(videoId, { slideLogs });

      if (finishRes.data.resultType === 'FAILURE') {
        throw new Error('영상 처리 요청 실패');
      }

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
