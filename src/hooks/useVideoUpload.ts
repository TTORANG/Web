// src/hooks/useVideoUpload.ts
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
      // 1. 영상 세션 생성
      console.log('📹 [1/4] 영상 세션 생성 시작');
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
      console.log('✅ Video ID 생성 완료:', videoId);

      // 2. 청크 분할
      console.log('📦 [2/4] 영상 청크 분할 시작');
      const CHUNK_SIZE = 1024 * 1024; // 1MB
      const totalChunks = Math.ceil(videoBlob.size / CHUNK_SIZE);
      const chunks: Blob[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, videoBlob.size);
        chunks.push(videoBlob.slice(start, end, 'video/webm'));
      }

      console.log(
        `✅ ${totalChunks}개의 청크로 분할 완료 (총 ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB)`,
      );

      // 3. 각 청크 업로드
      console.log('📤 [3/4] 청크 업로드 시작');
      setProgress({
        uploadedChunks: 0,
        totalChunks,
        percentage: 0,
        currentStep: 'uploading',
      });

      for (let i = 0; i < chunks.length; i++) {
        const chunkSize = (chunks[i].size / 1024).toFixed(2);
        console.log(`  📤 청크 ${i + 1}/${totalChunks} 업로드 중... (${chunkSize} KB)`);

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

        console.log(`  ✅ 청크 ${uploadedChunks}/${totalChunks} 완료 (${percentage}%)`);
      }

      console.log('✅ 모든 청크 업로드 완료');

      // 4. 녹화 종료 및 영상 처리
      console.log('🎬 [4/4] 영상 처리 시작');
      console.log('  📝 슬라이드 로그:', slideLogs);

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

      console.log('✅ 영상 처리 완료:', {
        videoId: finishData.success.videoId,
        status: finishData.success.status,
        slideCount: finishData.success.slideCount,
        slideDurations: finishData.success.slideDurations,
      });

      setProgress({
        uploadedChunks: totalChunks,
        totalChunks,
        percentage: 100,
        currentStep: 'done',
      });

      console.log('🎉 업로드 프로세스 완료!');
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
        console.error('❌ API 에러:', {
          code: apiError.errorCode,
          reason: apiError.reason,
        });
      }

      console.error('❌ 업로드 실패:', err);
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
