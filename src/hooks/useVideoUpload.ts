import { useState } from 'react';

import { videosApi } from '@/api/endpoints/videos';
import type { FinishVideoResponse, StartVideoResponse } from '@/api/endpoints/videos';

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
  ): Promise<number | null> => {
    setIsUploading(true);
    setError(null);

    try {
      setProgress({
        uploadedChunks: 0,
        totalChunks: 0,
        percentage: 0,
        currentStep: 'preparing',
      });

      const startResponse = await videosApi.startVideo({ projectId, title });
      const startData: StartVideoResponse = startResponse.data;

      if (startData.resultType === 'FAILURE' || !startData.success?.videoId) {
        throw new Error(startData.error?.reason || 'Video ID를 받지 못했습니다.');
      }

      const videoId = startData.success.videoId;
      const CHUNK_SIZE = 1024 * 1024; // 1MB
      const totalChunks = Math.ceil(videoBlob.size / CHUNK_SIZE);
      const chunks: Blob[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, videoBlob.size);
        chunks.push(videoBlob.slice(start, end, 'video/webm'));
      }

      setProgress({
        uploadedChunks: 0,
        totalChunks,
        percentage: 0,
        currentStep: 'uploading',
      });

      for (let i = 0; i < chunks.length; i++) {
        const chunkSize = (chunks[i].size / 1024).toFixed(2);

        const uploadResponse = await videosApi.uploadChunk(videoId, i, chunks[i]);

        if (uploadResponse.data.resultType === 'FAILURE') {
          throw new Error(uploadResponse.data.error?.reason || `청크 ${i} 업로드에 실패했습니다.`);
        }

        const uploadedChunks = i + 1;
        const percentage = Math.round((uploadedChunks / totalChunks) * 100);

        setProgress({
          uploadedChunks,
          totalChunks,
          percentage,
          currentStep: 'uploading',
        });
      }

      setProgress({
        uploadedChunks: totalChunks,
        totalChunks,
        percentage: 100,
        currentStep: 'finishing',
      });

      const finishResponse = await videosApi.finishVideo(videoId, { slideLogs });
      const finishData: FinishVideoResponse = finishResponse.data;

      if (finishData.resultType === 'FAILURE') {
        throw new Error(finishData.error?.reason || '영상 처리에 실패했습니다.');
      }

      setProgress({
        uploadedChunks: totalChunks,
        totalChunks,
        percentage: 100,
        currentStep: 'done',
      });

      return videoId;
    } catch (err: unknown) {
      let errorMessage = '업로드 중 오류가 발생했습니다.';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      const axiosError = err as {
        response?: {
          data?: {
            error?: {
              reason?: string;
              errorCode?: string;
            };
          };
        };
      };

      if (axiosError?.response?.data?.error) {
        const apiError = axiosError.response.data.error;
        errorMessage = apiError.reason || errorMessage;
      }
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadVideo,
    isUploading,
    progress,
    error,
  };
};
