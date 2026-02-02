// src/api/endpoints/videos/index.ts
import { apiClient } from '@/api/client';

/**
 * 영상 녹화 관련 DTO 정의
 */
export interface StartVideoRequest {
  projectId: number;
  title: string;
}

export interface StartVideoResponse {
  resultType: 'SUCCESS' | 'FAILURE';
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: {
    videoId: number;
  };
}

export interface FinishVideoRequest {
  slideLogs: Array<{
    slideId: number;
    timestampMs: number;
  }>;
}

export interface FinishVideoResponse {
  resultType: 'SUCCESS' | 'FAILURE';
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: {
    videoId: string;
    status: string;
    slideCount: number;
    slideDurations: Array<{
      slideId: string;
      totalDurationMs: number;
    }>;
  };
}

export interface ChunkUploadResponse {
  resultType: 'SUCCESS' | 'FAILURE';
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: {
    ok: boolean;
  };
}

export const videosApi = {
  // POST /videos/start - 영상 녹화 세션 생성
  startVideo: (data: StartVideoRequest) =>
    apiClient.post<StartVideoResponse>('/videos/start', data),

  // POST /videos/{videoId}/chunks/{chunkIndex} - 청크 업로드
  uploadChunk: (videoId: number, chunkIndex: number, file: Blob) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<ChunkUploadResponse>(
      `/videos/${videoId}/chunks/${chunkIndex}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },

  // POST /videos/{videoId}/finish - 녹화 종료 및 영상 처리 시작
  finishVideo: (videoId: number, data: FinishVideoRequest) =>
    apiClient.post<FinishVideoResponse>(`/videos/${videoId}/finish`, data),

  // GET /videos/{videoId} - 영상 상세 조회
  getVideoDetail: (videoId: number) => apiClient.get(`/videos/${videoId}`),

  // GET /videos/{videoId}/slides - 슬라이드 타임라인 조회
  getVideoSlides: (videoId: number) => apiClient.get(`/videos/${videoId}/slides`),
};
